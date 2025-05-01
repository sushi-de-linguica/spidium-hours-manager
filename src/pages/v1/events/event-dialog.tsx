import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IEvent, IRun, IMember } from "@/domain";
import { Import, FileJson } from "lucide-react";
import { HoraroImportService } from "@/services/horaro-import-service";
import { toast } from "react-toastify";
import { convertTime } from "@/helpers/convert-time";
import { getMDString } from "@/helpers/get-md-string";
import { sanitizeString } from "@/helpers/sanitize-string";
import { randomUUID } from "crypto";
import { useMemberStore } from "@/stores";

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: IEvent | null;
  onSave: (event: IEvent) => void;
}

export function EventDialog({
  isOpen,
  onClose,
  event,
  onSave,
}: EventDialogProps) {
  const { addMember, state } = useMemberStore();
  const [formData, setFormData] = useState<IEvent>({
    name: "",
    scheduleLink: "",
    runs: [],
    created_at: new Date(),
    updated_at: null,
    deleted_at: null,
  });
  const [importedRuns, setImportedRuns] = useState<IRun[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingImport, setLoadingImport] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        scheduleLink: event.scheduleLink || "",
      });
    } else {
      setFormData({
        name: "",
        scheduleLink: "",
        runs: [],
        created_at: new Date(),
        updated_at: null,
        deleted_at: null,
      });
    }
    setErrors({});
  }, [event, isOpen]);

  const handleChange = (field: keyof IEvent, value: string) => {
    setFormData({ ...formData, [field]: value });

    // Clear error when field is updated
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name || !formData.name?.trim()) {
      newErrors.name = "Nome do evento é obrigatório";
    }

    if (
      formData.scheduleLink &&
      !/^https?:\/\/.+/.test(formData.scheduleLink)
    ) {
      newErrors.scheduleLink =
        "O link da agenda precisa começar com http:// or https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSave({
        ...formData,
        runs: [...formData.runs, ...importedRuns],
        id: event?.id,
      });
      setImportedRuns([]);
    }
  };

  const findExistingMember = (name: string, twitchUsername?: string): IMember | null => {
    const normalizedName = sanitizeString(name.toLowerCase());

    return state.members.find((member: IMember) => {
      // Check member name
      const normalizedMemberName = sanitizeString(member.name.toLowerCase());
      if (normalizedMemberName === normalizedName) {
        return true;
      }

      // Check primary Twitch
      if (member.primaryTwitch) {
        const normalizedPrimaryTwitch = sanitizeString(member.primaryTwitch.toLowerCase());
        if (normalizedPrimaryTwitch === normalizedName) {
          return true;
        }
      }

      // Check secondary Twitch
      if (member.secondaryTwitch) {
        const normalizedSecondaryTwitch = sanitizeString(member.secondaryTwitch.toLowerCase());
        if (normalizedSecondaryTwitch === normalizedName) {
          return true;
        }
      }

      // If twitchUsername is provided, check against member's Twitch usernames
      if (twitchUsername) {
        const normalizedTwitch = sanitizeString(twitchUsername.toLowerCase());
        const memberPrimaryTwitch = member.primaryTwitch ? sanitizeString(member.primaryTwitch.toLowerCase()) : '';
        const memberSecondaryTwitch = member.secondaryTwitch ? sanitizeString(member.secondaryTwitch.toLowerCase()) : '';

        if (normalizedTwitch === memberPrimaryTwitch || normalizedTwitch === memberSecondaryTwitch) {
          return true;
        }
      }

      return false;
    }) || null;
  };

  const parseRunners = (runnersText: string): string[] => {
    // Split by common separators and clean up
    return runnersText
      .split(/[,;]| vs | e | e\s| e$|, e |, e$|, e\s| e,| e,/i)
      .map(runner => runner.trim())
      .filter(runner => runner.length > 0);
  };

  const formatTimeToHHMMSS = (time: string): string => {
    // Remove PT prefix if present
    time = time.replace('PT', '');

    // Extract hours, minutes, and seconds
    const hours = time.match(/(\d+)H/)?.[1] || '00';
    const minutes = time.match(/(\d+)M/)?.[1] || '00';
    const seconds = time.match(/(\d+)S/)?.[1] || '00';

    // Pad with zeros if needed
    const paddedHours = hours.padStart(2, '0');
    const paddedMinutes = minutes.padStart(2, '0');
    const paddedSeconds = seconds.padStart(2, '0');

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  };

  const handleImportFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);

        if (!jsonData.schedule?.items || !Array.isArray(jsonData.schedule.items)) {
          toast.error("Formato de arquivo JSON inválido. O arquivo deve ser um JSON exportado do Horaro.");
          return;
        }

        const { items, columns } = jsonData.schedule;
        const gameIndex = columns.indexOf("Jogo");
        const categoryIndex = columns.indexOf("Categoria");
        const runnerIndex = columns.indexOf("Runner");

        if (gameIndex === -1 || categoryIndex === -1 || runnerIndex === -1) {
          toast.error("Colunas necessárias não encontradas no JSON. Verifique se o arquivo contém as colunas 'Jogo', 'Categoria' e 'Runner'.");
          return;
        }

        // Create a map to store unique members
        const uniqueMembers = new Map<string, IMember>();

        const runs = items.map((item: any) => {
          const estimate = formatTimeToHHMMSS(item.length);
          const game = item.data[gameIndex] || "";
          const category = item.data[categoryIndex] || "";
          const runnersData = item.data[runnerIndex] || "";

          const runners = parseRunners(runnersData).map((runnerName: string) => {
            const normalizedName = sanitizeString(runnerName.toLowerCase());

            // Check if we already have this member in our map
            if (uniqueMembers.has(normalizedName)) {
              return uniqueMembers.get(normalizedName)!;
            }

            const existingMember = findExistingMember(runnerName);

            if (existingMember) {
              // Add to our map to reuse later
              uniqueMembers.set(normalizedName, existingMember);
              return existingMember;
            }

            const newMember: IMember = {
              id: randomUUID(),
              name: runnerName,
              gender: "",
              primaryTwitch: runnerName.toLowerCase().replace(/\s+/g, ''),
              streamAt: runnerName.toLowerCase().replace(/\s+/g, ''),
            };
            addMember(newMember);
            // Add to our map to reuse later
            uniqueMembers.set(normalizedName, newMember);
            return newMember;
          });

          return {
            id: randomUUID(),
            runners,
            hosts: [],
            comments: [],
            estimate,
            game,
            category,
            platform: "",
            year: "",
            seoGame: "",
            seoTitle: "",
            images: [],
          } as IRun;
        });

        setImportedRuns(runs);
        toast.success(`${runs.length} runs importadas com sucesso!`);
      } catch (error) {
        console.error("Error importing from JSON:", error);
        toast.error("Erro ao importar do arquivo JSON");
      }
    };
    reader.readAsText(file);
  };

  const handleImportRunsFromHoraro = async () => {
    if (!formData.scheduleLink || !formData.scheduleLink.startsWith("https://horaro.org/")) {
      toast.error("Por favor, insira um link do Horaro válido");
      return;
    }

    setLoadingImport(true);

    try {
      const horaroService = new HoraroImportService(formData.scheduleLink);
      const schedule = await horaroService.getSchedule();

      if (!schedule) {
        toast.error("Não foi possível importar dados do horaro.org :(");
        return;
      }

      const runnerColumnIndex = schedule.columns.findIndex((column: string) =>
        ["runners", "runner", "corredor", "corredores"].includes(
          column.toLowerCase()
        )
      );
      const gameColumnIndex = schedule.columns.findIndex((column: string) =>
        ["jogo", "jogos", "game", "games"].includes(column.toLowerCase())
      );
      const categoryColumnIndex = schedule.columns.findIndex((column: string) =>
        ["categoria", "categorias", "category", "categories"].includes(
          column.toLowerCase()
        )
      );

      const isValidColumns =
        runnerColumnIndex >= 0 &&
        gameColumnIndex >= 0 &&
        categoryColumnIndex >= 0;

      if (!isValidColumns) {
        toast.error(
          "Parace que as colunas necessárias 'Runner', 'Jogo' ou 'Categoria' não foram identificadas"
        );
        return;
      }

      // Create a map to store unique members
      const uniqueMembers = new Map<string, IMember>();

      const runs = schedule.items
        .filter(
          (run: any) => run.data[gameColumnIndex] && run.data[categoryColumnIndex]
        )
        .map((run: any) => {
          const estimate = formatTimeToHHMMSS(run.length);
          const game = run.data[gameColumnIndex];
          const category = run.data[categoryColumnIndex];
          const runnersData = run.data[runnerColumnIndex];

          const mappedRunners = getMDString(runnersData);
          const runners = mappedRunners.flatMap((runner: any) => {
            const runnerText = runner.text;
            const twitchUsername = runner.value ? runner.value.split("twitch.tv/")[1] : "";

            return parseRunners(runnerText).map((runnerName: string) => {
              const normalizedName = sanitizeString(runnerName.toLowerCase());

              // Check if we already have this member in our map
              if (uniqueMembers.has(normalizedName)) {
                return uniqueMembers.get(normalizedName)!;
              }

              const existingMember = findExistingMember(runnerName, twitchUsername);

              if (existingMember) {
                // Add to our map to reuse later
                uniqueMembers.set(normalizedName, existingMember);
                return existingMember;
              }

              const newMember: IMember = {
                id: randomUUID(),
                name: runnerName,
                gender: "",
                primaryTwitch: twitchUsername || runnerName.toLowerCase().replace(/\s+/g, ''),
                streamAt: twitchUsername || runnerName.toLowerCase().replace(/\s+/g, ''),
              };
              addMember(newMember);
              // Add to our map to reuse later
              uniqueMembers.set(normalizedName, newMember);
              return newMember;
            });
          });

          return {
            id: randomUUID(),
            runners,
            hosts: [],
            comments: [],
            estimate,
            game,
            category,
            platform: "",
            year: "",
            seoGame: "",
            seoTitle: "",
            images: [],
          } as IRun;
        });

      setImportedRuns(runs);
      toast.success(`${runs.length} runs importadas com sucesso!`);
    } catch (error) {
      console.error("Error importing from Horaro:", error);
      toast.error("Ocorreu um erro ao importar do Horaro");
    } finally {
      setLoadingImport(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {event ? `Editar ${event.name}` : "Adicionar novo evento"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                className="col-span-3"
                placeholder="24 horas de spidium #123"
              />
              {errors.name && (
                <p className="col-span-3 col-start-2 text-sm text-red-500">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="flex flex-col items-start gap-4">
              <div className="w-full">
                <Label htmlFor="scheduleLink" className="text-right">
                  Link da agenda
                </Label>
                <div className="w-full flex flex-row gap-2">
                  <Input
                    id="scheduleLink"
                    value={formData.scheduleLink}
                    onChange={(e) =>
                      handleChange("scheduleLink", e.target.value)
                    }
                    className="w-full"
                    placeholder="https://horaro.org/yourevent/2023"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleImportRunsFromHoraro}
                      disabled={loadingImport || !formData.scheduleLink?.startsWith("https://horaro.org/")}
                    >
                      <Import className="mr-2 h-4 w-4" />
                      {loadingImport ? "Importando..." : "Importar"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FileJson className="mr-2 h-4 w-4" />
                      Importar JSON
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImportFromJson}
                      accept=".json"
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
              <div>
                {errors.scheduleLink && (
                  <p className="col-span-3 col-start-2 text-sm text-red-500">
                    {errors.scheduleLink}
                  </p>
                )}
              </div>
              <div className="col-span-3 col-start-2 text-xs text-muted-foreground">
                Opcional: Link da agenda, caso utilize do HORARO você pode
                importar as runs de forma simplificada.
              </div>
              {importedRuns.length > 0 && (
                <div className="col-span-3 col-start-2 text-xs text-green-500">
                  {importedRuns.length} runs prontas para serem adicionadas ao evento.
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Adicionar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
