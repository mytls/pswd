const solver = (handler: (...handlerProps: any) => any) => {
  return handler as () => {};
};

export default solver;
