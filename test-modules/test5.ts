while (true) {
  try {
    const worker = new Worker(
      new URL("./test5-worker.ts", import.meta.url).href,
      {
        type: "module",
      }
    );

    await new Promise((resolve) => {
      worker.onerror = (error) => {
        error.preventDefault();
        console.log(`error: `, error);
        resolve(null);
      };
    });
  } catch (error) {
    console.error("error2: ", error);
  }
}
