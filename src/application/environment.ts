interface IEnvironment {
  isTest: boolean;
  testSufix: string;
  SHM_DATABASE_URL: string;
}

const environment: IEnvironment = {
  isTest:
    import.meta.env.MODE === "test" && import.meta.env.VITE_TEST == "true",
  testSufix: import.meta.env.VITE_TEST_SUFIX,
  SHM_DATABASE_URL:
    "https://usina.spidium.live/shm-database/shm-database-v0_4_0.json",
};

export { environment };
