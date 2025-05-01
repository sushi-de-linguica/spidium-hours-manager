import { useEffect } from "react";
import {
  CONFIGURATION_DEFAULT_STATE,
  useConfigurationStore,
  useNightbot,
  useTwitch,
} from "@/stores";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  NightbotApiService,
  getUrlToGetTokenFromNightbot,
} from "@/services/nightbot-service";

import { INightbotCommandModel } from "@/domain";

import { toast } from "react-toastify";
import { useObsStore } from "@/stores/slices/obs";
import {
  TwitchApiService,
  getUrlToGetTokenFromTwitch,
} from "@/services/twitch-service";

const OptionsForm = () => {
  const currentConfiguration = useConfigurationStore((store) => store.state);
  const { updateConfiguration } = useConfigurationStore();
  const twitchStore = useTwitch();
  const [commands, setCommands] = useState<INightbotCommandModel[]>([]);
  const [isShowInfos, setIsShowInfos] = useState(false);
  const [isShowWsInfos, setIsShowWsInfos] = useState(false);
  const { setState: setObsStoreState, state: obsStoreState } = useObsStore();
  const [obsVersion, setObsVersion] = useState(obsStoreState.version);

  const [configuration, setConfiguration] = useState(
    currentConfiguration
      ? { ...currentConfiguration }
      : CONFIGURATION_DEFAULT_STATE
  );

  const handleUpdateCommandsList = async () => {
    const service = new NightbotApiService();
    return service.getCommands().then(({ data }) => {
      setCommands(data.commands);
      return data;
    });
  };

  useEffect(() => {
    handleUpdateCommandsList();
  }, []);

  const nightbotStore = useNightbot();

  const isDisabledLoginButton = useMemo(
    () =>
      !currentConfiguration.nightbot_client_id ||
      !currentConfiguration.nightbot_client_secret ||
      !currentConfiguration.nightbot_redirect_uri,
    [configuration, currentConfiguration, updateConfiguration]
  );

  const makeResultObjectFromFields = (fields: string[]) => {
    const result = {} as any;

    fields.forEach((key) => {
      result[key] = (configuration as any)[key];
    });

    return result;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setConfiguration((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleUpdateConfiguration = () => {
    const resultToUpdate = makeResultObjectFromFields([
      "nightbot_client_id",
      "nightbot_client_secret",
      "nightbot_redirect_uri",
      "twitch_client_id",
      "twitch_redirect_uri",
    ]);

    setConfiguration({
      ...configuration,
      ...resultToUpdate,
    });

    updateConfiguration({
      ...currentConfiguration,
      ...resultToUpdate,
      nightbot_token: configuration.nightbot_token,
      twitch_token: configuration.twitch_token,
    });

    if (configuration.nightbot_token !== nightbotStore.state.access_token) {
      nightbotStore.setState({
        ...nightbotStore.state,
        access_token: configuration.nightbot_token,
      });
    }

    const changedTwitchFields =
      twitchStore.state.access_token !== configuration.twitch_token ||
      twitchStore.state.client_id !== configuration.twitch_client_id;

    twitchStore.setState({
      ...twitchStore.state,
      access_token: configuration.twitch_token,
      client_id: configuration.twitch_client_id,
    });

    if (changedTwitchFields) {
      setTimeout(handleTwitchTest, 1000);
    }

    toast.success("Configurações atualizadas com sucesso");
  };

  const handleChangeRadio = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log(event);
    setObsVersion(parseInt(event.target.value));
  };

  const handleObsTest = () => {
    if (window.obsService) {
      window.obsService
        .connect()
        .then((result) => {
          console.log("chegou ", result);
          if (result === true) {
            toast.success("Conexão com OBS estabelecida com sucesso!");
            return;
          }

          let errorMessage = "Erro ao estabelecer conexão com OBS. ";
          if (result && result.error) {
            errorMessage += result.error;
          }
          toast.error(errorMessage);
        })
        .catch(() => {
          toast.error("Erro ao estabelecer conexão com OBS");
        });
    }
  };

  const handleTwitchTest = () => {
    const twitchApiService = new TwitchApiService();

    twitchApiService
      .updateBroadcastId()
      .then((data) => {
        console.log("twitch data", data);
        toast.success("Conexão com Twitch estabelecida com sucesso!");
      })
      .catch(() => {
        toast.error("Erro ao estabelecer conexão com Twitch");
      });
  };

  const handleUpdateCommandSettings = () => {
    const resultToUpdate = makeResultObjectFromFields([
      "nightbot_runner_command_id",
      "nightbot_runner_text_singular",
      "nightbot_runner_text_plural",
      "nightbot_host_command",
      "nightbot_host_text_singular",
      "nightbot_host_text_plural",
      "nightbot_commentator_command",
      "nightbot_commentator_text_singular",
      "nightbot_commentator_text_plural",
    ]);

    updateConfiguration({
      ...currentConfiguration,
      ...resultToUpdate,
    });

    toast.success("Configurações de comandos atualizadas com sucesso");
  };

  const handleUpdateObs = async () => {
    const result = makeResultObjectFromFields([
      "obs_ws_address",
      "obs_ws_password",
    ]);

    const isNeedReconnect =
      currentConfiguration.obs_ws_address !== result["obs_ws_address"] ||
      currentConfiguration.obs_ws_password !== result["obs_ws_password"];

    updateConfiguration({
      ...currentConfiguration,
      ...result,
    });

    if (obsStoreState.version !== obsVersion) {
      setObsStoreState({
        ...obsStoreState,
        version: obsVersion,
      });
    }

    toast.success("Configurações do OBS atualizadas com sucesso");

    if (isNeedReconnect && window.obsService) {
      window.obsService.connect();
    }
  };

  const handleOpenNightbotAccessTokenLink = () => {
    const URL = getUrlToGetTokenFromNightbot({
      redirect_uri: configuration.nightbot_redirect_uri,
      client_id: configuration.nightbot_client_id,
    });

    window.open(URL, "_blank");
  };

  const handleChangeCommand = (
    event: any,
    field:
      | "nightbot_runner_command_id"
      | "nightbot_host_command"
      | "nightbot_commentator_command",
    value: INightbotCommandModel
  ) => {
    setConfiguration({
      ...configuration,
      [field]: value ? value : null,
    });
  };

  const handleUpdateTemplates = () => {
    const result = makeResultObjectFromFields(["seo_title_template"]);

    updateConfiguration({
      ...currentConfiguration,
      ...result,
    });

    toast.success("Configurações do Templates atualizadas com sucesso");
  };

  const handleOpenTwitchAccessTokenLink = () => {
    const URL = getUrlToGetTokenFromTwitch({
      client_id: configuration.twitch_client_id,
      redirect_uri: configuration.twitch_redirect_uri,
    });

    window.open(URL, "_blank");
  };

  const isDisabledTwitchLoginButton = useMemo(
    () =>
      !currentConfiguration.twitch_client_id ||
      !currentConfiguration.twitch_redirect_uri,
    [configuration, currentConfiguration, updateConfiguration]
  );

  return (
    <FormControl>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Twitch</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexDirection="column" gap="8px">
            <TextField
              autoFocus
              margin="dense"
              name="twitch_client_id"
              label="CLIENT_ID"
              type={isShowInfos ? "text" : "password"}
              value={configuration.twitch_client_id}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              autoFocus
              margin="dense"
              name="twitch_redirect_uri"
              label="REDIRECT_URI"
              value={configuration.twitch_redirect_uri}
              onChange={handleChange}
              fullWidth
            />
          </Box>

          <Box
            marginTop="24px"
            marginBottom="12px"
            display="flex"
            flexDirection="row"
            gap="12px"
          >
            <Button
              color="primary"
              variant="contained"
              disabled={isDisabledTwitchLoginButton}
              onClick={handleOpenTwitchAccessTokenLink}
            >
              Obter token da Twitch
            </Button>
          </Box>

          <Box>
            <TextField
              autoFocus
              margin="dense"
              name="twitch_token"
              label="Token"
              type={isShowInfos ? "text" : "password"}
              value={configuration.twitch_token}
              onChange={handleChange}
              fullWidth
            />
          </Box>

          <Box marginTop="24px" display="flex" flexDirection="row" gap="12px">
            <Button
              color="success"
              variant="contained"
              onClick={handleUpdateConfiguration}
            >
              Salvar
            </Button>

            <Button
              color="warning"
              variant="contained"
              onClick={() => setIsShowInfos(!isShowInfos)}
            >
              {!isShowInfos
                ? "Mostrar informações sensiveis"
                : "Esconder informações sensiveis"}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Nightbot</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexDirection="column" gap="8px">
            <TextField
              autoFocus
              margin="dense"
              name="nightbot_client_id"
              label="CLIENT_ID"
              type={isShowInfos ? "text" : "password"}
              value={configuration.nightbot_client_id}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              autoFocus
              margin="dense"
              name="nightbot_client_secret"
              label="CLIENT_SECRET"
              type={isShowInfos ? "text" : "password"}
              value={configuration.nightbot_client_secret}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              autoFocus
              margin="dense"
              name="nightbot_redirect_uri"
              label="REDIRECT_URI"
              value={configuration.nightbot_redirect_uri}
              onChange={handleChange}
              fullWidth
            />
          </Box>

          <Box
            marginTop="24px"
            marginBottom="12px"
            display="flex"
            flexDirection="row"
            gap="12px"
          >
            <Button
              color="primary"
              variant="contained"
              disabled={isDisabledLoginButton}
              onClick={handleOpenNightbotAccessTokenLink}
            >
              Obter token do Nightbot
            </Button>
          </Box>

          <Box>
            <TextField
              autoFocus
              margin="dense"
              name="nightbot_token"
              label="Token"
              type={isShowInfos ? "text" : "password"}
              value={configuration.nightbot_token}
              onChange={handleChange}
              fullWidth
            />
          </Box>

          <Box marginTop="24px" display="flex" flexDirection="row" gap="12px">
            <Button
              color="success"
              variant="contained"
              onClick={handleUpdateConfiguration}
            >
              Salvar
            </Button>

            <Button
              color="warning"
              variant="contained"
              onClick={() => setIsShowInfos(!isShowInfos)}
            >
              {!isShowInfos
                ? "Mostrar informações sensiveis"
                : "Esconder informações sensiveis"}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Configurações dos comandos</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box display="flex" flexDirection="column" gap="8px">
            <Autocomplete<any>
              fullWidth
              disablePortal
              options={commands}
              multiple={false}
              value={configuration.nightbot_runner_command_id}
              isOptionEqualToValue={(option, value) =>
                option?._id === value?._id
              }
              getOptionLabel={(option) => option.name}
              onChange={(event, value) =>
                handleChangeCommand(event, "nightbot_runner_command_id", value)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="filled"
                  name="nightbot_runner_command_id"
                  label="Comando de redes sociais do Runner"
                  placeholder="Runner(s)"
                />
              )}
            />
            <TextField
              autoFocus
              margin="dense"
              name="nightbot_runner_text_singular"
              label="Texto do comando de Runner (singular)"
              value={configuration.nightbot_runner_text_singular}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              autoFocus
              margin="dense"
              name="nightbot_runner_text_plural"
              label="Texto do comando de Runner (plural)"
              value={configuration.nightbot_runner_text_plural}
              onChange={handleChange}
              fullWidth
            />

            <hr />
            <Autocomplete<any>
              fullWidth
              disablePortal
              options={commands}
              multiple={false}
              value={configuration.nightbot_host_command}
              isOptionEqualToValue={(option, value) =>
                option?._id === value?._id
              }
              getOptionLabel={(option) => option.name}
              onChange={(event, value) =>
                handleChangeCommand(event, "nightbot_host_command", value)
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="filled"
                  name="nightbot_host_command"
                  label="Comando de redes sociais do HOST"
                  placeholder="Runner(s)"
                />
              )}
            />

            <TextField
              autoFocus
              margin="dense"
              name="nightbot_host_text_singular"
              label="Texto do comando de Host (singular)"
              value={configuration.nightbot_host_text_singular}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              autoFocus
              margin="dense"
              name="nightbot_host_text_plural"
              label="Texto do comando de Host (plural)"
              value={configuration.nightbot_host_text_plural}
              onChange={handleChange}
              fullWidth
            />

            <hr />
            <Autocomplete<any>
              fullWidth
              disablePortal
              options={commands}
              multiple={false}
              value={configuration.nightbot_commentator_command}
              isOptionEqualToValue={(option, value) =>
                option?._id === value?._id
              }
              getOptionLabel={(option) => option.name}
              onChange={(event, value) =>
                handleChangeCommand(
                  event,
                  "nightbot_commentator_command",
                  value
                )
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="filled"
                  name="nightbot_commentator_command"
                  label="Comando de redes sociais do COMENTARISTA"
                  placeholder="Runner(s)"
                />
              )}
            />
            <TextField
              autoFocus
              margin="dense"
              name="nightbot_commentator_text_singular"
              label="Texto do comando de Comentarista (singular)"
              value={configuration.nightbot_commentator_text_singular}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              autoFocus
              margin="dense"
              name="nightbot_commentator_text_plural"
              label="Texto do comando de Comentarista (plural)"
              value={configuration.nightbot_commentator_text_plural}
              onChange={handleChange}
              fullWidth
            />

            <Alert severity="info">
              Para que NÃO seja atualizado o comando, basta deixar os campos de
              comando em BRANCO!
            </Alert>
          </Box>

          <Box marginTop="24px" display="flex" flexDirection="row" gap="12px">
            <Button
              color="primary"
              variant="contained"
              onClick={handleUpdateCommandsList}
            >
              Listar comandos
            </Button>

            <Button
              color="success"
              variant="contained"
              onClick={handleUpdateCommandSettings}
            >
              Salvar
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>OBS</AccordionSummary>
        <AccordionDetails>
          <FormControl style={{ marginBottom: "24px" }}>
            <FormLabel id="radio-buttons-group-label">Versão do OBS</FormLabel>
            <RadioGroup
              aria-labelledby="radio-buttons-group-label"
              onChange={handleChangeRadio}
              name="version"
              value={obsVersion}
            >
              <FormControlLabel
                value="4"
                control={<Radio />}
                checked={obsVersion == 4}
                label="27.x"
              />
              <FormControlLabel
                value="5"
                control={<Radio />}
                checked={obsVersion == 5}
                label="28.x / 29.x"
              />
            </RadioGroup>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            name="obs_ws_address"
            label="Websocket Endereço (padrão: 127.0.0.1:4455)"
            type={isShowWsInfos ? "text" : "password"}
            value={configuration.obs_ws_address}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            name="obs_ws_password"
            label="Websocket Senha"
            type={isShowWsInfos ? "text" : "password"}
            value={configuration.obs_ws_password}
            onChange={handleChange}
            fullWidth
          />

          <Box marginTop="24px" display="flex" flexDirection="row" gap="12px">
            <Button
              color="success"
              variant="contained"
              onClick={handleUpdateObs}
            >
              Salvar
            </Button>

            <Button
              color="warning"
              variant="contained"
              onClick={() => setIsShowWsInfos(!isShowWsInfos)}
            >
              {!isShowWsInfos
                ? "Mostrar informações sensiveis"
                : "Esconder informações sensiveis"}
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          Templates padrões da live
        </AccordionSummary>
        <AccordionDetails>
          <TextField
            autoFocus
            margin="dense"
            name="seo_title_template"
            label="Template do titulo da live"
            value={configuration.seo_title_template}
            onChange={handleChange}
            fullWidth
          />

          <Box marginTop="24px" display="flex" flexDirection="row" gap="12px">
            <Button
              color="success"
              variant="contained"
              onClick={handleUpdateTemplates}
            >
              Salvar
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Box marginTop="24px" marginBottom="8px" gap="8px" display="flex">
        <Button
          color="info"
          variant="outlined"
          onClick={() => {
            handleUpdateCommandsList()
              .then(() => {
                toast.success("Conexão com nightbot estabelecida com sucesso!");
              })
              .catch(() => {
                toast.error("Erro ao estabelecer conexão com nightbot");
              });
          }}
        >
          Testar conexão com nightbot
        </Button>

        <Button color="info" variant="outlined" onClick={handleObsTest}>
          Testar conexão com OBS
        </Button>

        <Button color="info" variant="outlined" onClick={handleTwitchTest}>
          Testar conexão com a Twitch
        </Button>
      </Box>
    </FormControl>
  );
};

export { OptionsForm };
