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
import {
  HoraroImportService,
  REGEX,
  IHoraroEventDataResponse,
} from "@/services/horaro-import-service";
import { toast } from "react-toastify";
import { getMDString } from "@/helpers/get-md-string";
import { sanitizeString } from "@/helpers/sanitize-string";
import { randomUUID } from "crypto";
import { useMemberStore } from "@/stores";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UNMAPPED_INDEX = -1;

export interface HoraroColumnMapping {
  runnersColumnIndex: number;
  gameColumnIndex: number;
  categoryColumnIndex: number;
  estimateColumnIndex: number;
  platformColumnIndex: number;
  yearColumnIndex: number;
  runnersSecondaryLinkColumnIndex: number;
}

function suggestHoraroMapping(
  schedule: IHoraroEventDataResponse,
): HoraroColumnMapping {
  const columns = schedule.columns;
  const find = (names: string[]) =>
    columns.findIndex((c: string) => names.includes(c.toLowerCase().trim()));
  return {
    runnersColumnIndex: find(["runners", "runner", "corredor", "corredores"]),
    gameColumnIndex: find(["jogo", "jogos", "game", "games"]),
    categoryColumnIndex: find([
      "categoria",
      "categorias",
      "category",
      "categories",
    ]),
    estimateColumnIndex: UNMAPPED_INDEX,
    platformColumnIndex: find([
      "plataforma",
      "plataformas",
      "platform",
      "platforms",
      "console",
      "consoles",
    ]),
    yearColumnIndex: find(["ano", "year", "anos", "years"]),
    runnersSecondaryLinkColumnIndex: UNMAPPED_INDEX,
  };
}

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
    horaroHiddenKey: "",
    runs: [],
    created_at: new Date(),
    updated_at: null,
    deleted_at: null,
  });
  const [importedRuns, setImportedRuns] = useState<IRun[]>([]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loadingImport, setLoadingImport] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [horaroSchedule, setHoraroSchedule] =
    useState<IHoraroEventDataResponse | null>(null);
  const [horaroMappingOpen, setHoraroMappingOpen] = useState(false);
  const [columnMapping, setColumnMapping] = useState<HoraroColumnMapping>({
    runnersColumnIndex: UNMAPPED_INDEX,
    gameColumnIndex: UNMAPPED_INDEX,
    categoryColumnIndex: UNMAPPED_INDEX,
    estimateColumnIndex: UNMAPPED_INDEX,
    platformColumnIndex: UNMAPPED_INDEX,
    yearColumnIndex: UNMAPPED_INDEX,
    runnersSecondaryLinkColumnIndex: UNMAPPED_INDEX,
  });

  useEffect(() => {
    if (event) {
      setFormData({
        ...event,
        scheduleLink: event.scheduleLink || "",
        horaroHiddenKey: event.horaroHiddenKey || "",
      });
    } else {
      setFormData({
        name: "",
        scheduleLink: "",
        horaroHiddenKey: "",
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

  const findExistingMember = (
    name: string,
    twitchUsername?: string,
  ): IMember | null => {
    const normalizedName = sanitizeString(name.toLowerCase());

    return (
      state.members.find((member: IMember) => {
        // Check member name
        const normalizedMemberName = sanitizeString(member.name.toLowerCase());
        if (normalizedMemberName === normalizedName) {
          return true;
        }

        // Check primary Twitch
        if (member.primaryTwitch) {
          const normalizedPrimaryTwitch = sanitizeString(
            member.primaryTwitch.toLowerCase(),
          );
          if (normalizedPrimaryTwitch === normalizedName) {
            return true;
          }
        }

        // Check secondary Twitch
        if (member.secondaryTwitch) {
          const normalizedSecondaryTwitch = sanitizeString(
            member.secondaryTwitch.toLowerCase(),
          );
          if (normalizedSecondaryTwitch === normalizedName) {
            return true;
          }
        }

        // If twitchUsername is provided, check against member's Twitch usernames
        if (twitchUsername) {
          const normalizedTwitch = sanitizeString(twitchUsername.toLowerCase());
          const memberPrimaryTwitch = member.primaryTwitch
            ? sanitizeString(member.primaryTwitch.toLowerCase())
            : "";
          const memberSecondaryTwitch = member.secondaryTwitch
            ? sanitizeString(member.secondaryTwitch.toLowerCase())
            : "";

          if (
            normalizedTwitch === memberPrimaryTwitch ||
            normalizedTwitch === memberSecondaryTwitch
          ) {
            return true;
          }
        }

        return false;
      }) || null
    );
  };

  const parseRunners = (runnersText: string): string[] => {
    // Split by common separators and clean up
    return runnersText
      .split(
        /[,;]| vs | e | e\s| e$|, e |, e$|, e\s| e,| e,| x | x\s| x$|, x |, x$|, x\s| x,| x,/i,
      )
      .map((runner) => runner.trim())
      .filter((runner) => runner.length > 0);
  };

  const formatTimeToHHMMSS = (time: string): string => {
    // Remove PT prefix if present
    time = time.replace("PT", "");

    // Extract hours, minutes, and seconds
    const hours = time.match(/(\d+)H/)?.[1] || "00";
    const minutes = time.match(/(\d+)M/)?.[1] || "00";
    const seconds = time.match(/(\d+)S/)?.[1] || "00";

    // Pad with zeros if needed
    const paddedHours = hours.padStart(2, "0");
    const paddedMinutes = minutes.padStart(2, "0");
    const paddedSeconds = seconds.padStart(2, "0");

    return `${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
  };

  const handleImportFromJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);

        if (
          !jsonData.schedule?.items ||
          !Array.isArray(jsonData.schedule.items)
        ) {
          toast.error(
            "Formato de arquivo JSON inválido. O arquivo deve ser um JSON exportado do Horaro.",
          );
          return;
        }

        const { items, columns } = jsonData.schedule;
        if (!columns || !Array.isArray(columns)) {
          toast.error(
            "Formato de arquivo JSON inválido. O schedule deve conter a propriedade 'columns' (array).",
          );
          return;
        }

        const schedule: IHoraroEventDataResponse = {
          id: "",
          name: "",
          columns,
          items,
        };
        setHoraroSchedule(schedule);
        setColumnMapping(suggestHoraroMapping(schedule));
        setHoraroMappingOpen(true);
      } catch (error) {
        console.error("Error importing from JSON:", error);
        toast.error("Erro ao importar do arquivo JSON");
      }
      event.target.value = "";
    };
    reader.readAsText(file);
  };

  function extractTwitchUsername(value: string): string {
    const trimmed = value.trim();
    const match = trimmed.match(/twitch\.tv\/([^/?]+)/);
    return match ? match[1] : trimmed;
  }

  function buildRunsFromScheduleWithMapping(
    schedule: IHoraroEventDataResponse,
    mapping: HoraroColumnMapping,
  ): IRun[] {
    const uniqueMembers = new Map<string, IMember>();

    return schedule.items.map((run: { length: string; data: string[] }) => {
      const estimate = formatTimeToHHMMSS(run.length);
      const game =
        mapping.gameColumnIndex >= 0
          ? (run.data[mapping.gameColumnIndex] ?? "")
          : "";
      const category =
        mapping.categoryColumnIndex >= 0
          ? (run.data[mapping.categoryColumnIndex] ?? "")
          : "";
      const platform =
        mapping.platformColumnIndex >= 0
          ? (run.data[mapping.platformColumnIndex] ?? "")
          : "";
      const year =
        mapping.yearColumnIndex >= 0
          ? (run.data[mapping.yearColumnIndex] ?? "")
          : "";

      let runners: IMember[] = [];
      if (mapping.runnersColumnIndex >= 0) {
        const runnersData = run.data[mapping.runnersColumnIndex] ?? "";
        const secondaryParts =
          mapping.runnersSecondaryLinkColumnIndex >= 0
            ? (run.data[mapping.runnersSecondaryLinkColumnIndex] ?? "")
                .split(",")
                .map((s) => extractTwitchUsername(s))
            : [];

        const mappedRunners = getMDString(runnersData) as {
          text: string;
          value: string | null;
        }[];
        let runnerPosition = 0;
        runners = mappedRunners.flatMap((runner) => {
          const runnerText = runner.text;
          const twitchUsername = runner.value
            ? ((runner.value.split("twitch.tv/")[1] ?? "").split("?")[0] ?? "")
            : "";

          return parseRunners(runnerText).map((runnerName: string) => {
            const primaryTwitch =
              twitchUsername || runnerName.toLowerCase().replace(/\s+/g, "");
            const secondaryRaw = secondaryParts[runnerPosition] ?? "";
            runnerPosition += 1;
            const primaryNorm = sanitizeString(primaryTwitch.toLowerCase());
            const secondaryNorm = secondaryRaw
              ? sanitizeString(secondaryRaw.toLowerCase())
              : "";
            const useSecondary =
              !!secondaryRaw && secondaryNorm !== primaryNorm;
            const streamAt = useSecondary ? secondaryRaw : primaryTwitch;
            const memberSecondaryTwitch = useSecondary
              ? secondaryRaw
              : undefined;

            const normalizedName = sanitizeString(runnerName.toLowerCase());

            if (uniqueMembers.has(normalizedName)) {
              const member = uniqueMembers.get(normalizedName)!;
              const streamOverride = memberSecondaryTwitch
                ? { secondaryTwitch: memberSecondaryTwitch, streamAt }
                : { streamAt: member.primaryTwitch ?? primaryTwitch };
              return { ...member, ...streamOverride };
            }

            const existingMember = findExistingMember(
              runnerName,
              twitchUsername || undefined,
            );

            if (existingMember) {
              uniqueMembers.set(normalizedName, existingMember);
              const streamOverride = memberSecondaryTwitch
                ? { secondaryTwitch: memberSecondaryTwitch, streamAt }
                : { streamAt: existingMember.primaryTwitch ?? primaryTwitch };
              return { ...existingMember, ...streamOverride };
            }

            const newMember: IMember = {
              id: randomUUID(),
              name: runnerName,
              gender: "",
              primaryTwitch,
              streamAt,
              ...(memberSecondaryTwitch
                ? { secondaryTwitch: memberSecondaryTwitch }
                : {}),
            };
            addMember(newMember);
            uniqueMembers.set(normalizedName, newMember);
            return newMember;
          });
        });
      }

      return {
        id: randomUUID(),
        runners,
        hosts: [],
        comments: [],
        estimate,
        game,
        category,
        platform,
        year,
        seoGame: "",
        seoTitle: "",
        images: [],
      } as IRun;
    });
  }

  const handleImportRunsFromHoraro = async () => {
    if (
      !formData.scheduleLink ||
      !REGEX.HORARO_URL_EVENT_AND_PATH.exec(formData.scheduleLink)
    ) {
      toast.error("Por favor, insira um link do Horaro válido");
      return;
    }

    setLoadingImport(true);
    try {
      const horaroService = new HoraroImportService(
        formData.scheduleLink,
        formData.horaroHiddenKey,
      );
      const schedule = await horaroService.getScheduleJson();

      if (!schedule) {
        toast.error("Não foi possível importar dados do horaro.org :(");
        return;
      }

      setHoraroSchedule(schedule);
      setColumnMapping(suggestHoraroMapping(schedule));
      setHoraroMappingOpen(true);
    } catch (error) {
      console.error("Error importing from Horaro:", error);
      toast.error("Ocorreu um erro ao importar do Horaro");
    } finally {
      setLoadingImport(false);
    }
  };

  const handleConfirmHoraroMapping = () => {
    if (!horaroSchedule) return;
    const runs = buildRunsFromScheduleWithMapping(
      horaroSchedule,
      columnMapping,
    );
    setImportedRuns(runs);
    setHoraroSchedule(null);
    setHoraroMappingOpen(false);
    toast.success(`${runs.length} runs importadas com sucesso!`);
  };

  const handleCloseHoraroMapping = () => {
    setHoraroMappingOpen(false);
    setHoraroSchedule(null);
  };

  return (
    <>
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
                      placeholder="https://horaro.net/yourevent/2023"
                    />
                  </div>
                </div>
                <div className="grid gap-2 w-full">
                  <Label htmlFor="horaroHiddenKey">
                    Chave para colunas ocultas do horaro
                  </Label>
                  <div className="grid gap-2 grid-cols-3">
                    <Input
                      id="horaroHiddenKey"
                      type="password"
                      autoComplete="off"
                      value={formData.horaroHiddenKey ?? ""}
                      onChange={(e) =>
                        handleChange("horaroHiddenKey", e.target.value)
                      }
                      className="w-full col-span-2"
                      placeholder="Opcional"
                    />
                    <Button
                      type="button"
                      onClick={handleImportRunsFromHoraro}
                      disabled={
                        loadingImport ||
                        !REGEX.HORARO_URL_EVENT_AND_PATH.exec(
                          formData.scheduleLink || "",
                        ) ||
                        !!event
                      }
                    >
                      <Import className="mr-2 h-4 w-4" />
                      {loadingImport ? "Importando..." : "Importar"}
                    </Button>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!!event}
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
                  disabled={!!event}
                />
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
                    {importedRuns.length} runs prontas para serem adicionadas ao
                    evento.
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

      <Dialog
        open={horaroMappingOpen}
        onOpenChange={(open) => !open && handleCloseHoraroMapping()}
      >
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Mapear colunas do Horaro</DialogTitle>
          </DialogHeader>
          {horaroSchedule && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Runners</Label>
                <Select
                  value={String(columnMapping.runnersColumnIndex)}
                  onValueChange={(v) =>
                    setColumnMapping((prev) => ({
                      ...prev,
                      runnersColumnIndex: parseInt(v, 10),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(UNMAPPED_INDEX)}>
                      Não mapear
                    </SelectItem>
                    {horaroSchedule.columns.map((col, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Jogo (game)</Label>
                <Select
                  value={String(columnMapping.gameColumnIndex)}
                  onValueChange={(v) =>
                    setColumnMapping((prev) => ({
                      ...prev,
                      gameColumnIndex: parseInt(v, 10),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(UNMAPPED_INDEX)}>
                      Não mapear
                    </SelectItem>
                    {horaroSchedule.columns.map((col, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Categoria (category)</Label>
                <Select
                  value={String(columnMapping.categoryColumnIndex)}
                  onValueChange={(v) =>
                    setColumnMapping((prev) => ({
                      ...prev,
                      categoryColumnIndex: parseInt(v, 10),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(UNMAPPED_INDEX)}>
                      Não mapear
                    </SelectItem>
                    {horaroSchedule.columns.map((col, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Plataforma (platform)</Label>
                <Select
                  value={String(columnMapping.platformColumnIndex)}
                  onValueChange={(v) =>
                    setColumnMapping((prev) => ({
                      ...prev,
                      platformColumnIndex: parseInt(v, 10),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(UNMAPPED_INDEX)}>
                      Não mapear
                    </SelectItem>
                    {horaroSchedule.columns.map((col, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Ano (year)</Label>
                <Select
                  value={String(columnMapping.yearColumnIndex)}
                  onValueChange={(v) =>
                    setColumnMapping((prev) => ({
                      ...prev,
                      yearColumnIndex: parseInt(v, 10),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(UNMAPPED_INDEX)}>
                      Não mapear
                    </SelectItem>
                    {horaroSchedule.columns.map((col, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Vai transmitir na twitch:</Label>
                <Select
                  value={String(columnMapping.runnersSecondaryLinkColumnIndex)}
                  onValueChange={(v) =>
                    setColumnMapping((prev) => ({
                      ...prev,
                      runnersSecondaryLinkColumnIndex: parseInt(v, 10),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a coluna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={String(UNMAPPED_INDEX)}>
                      Não mapear
                    </SelectItem>
                    {horaroSchedule.columns.map((col, i) => (
                      <SelectItem key={i} value={String(i)}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCloseHoraroMapping}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleConfirmHoraroMapping}>
              Importar com mapeamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
