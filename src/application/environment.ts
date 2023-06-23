interface IEnvironment {
  isTest: boolean;
  testSufix: string;
}

const environment: IEnvironment = {
  isTest:
    import.meta.env.MODE === "test" && import.meta.env.VITE_TEST == "true",
  testSufix: import.meta.env.VITE_TEST_SUFIX,
};

export { environment };
