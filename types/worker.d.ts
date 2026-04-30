# Don't need this for the worker to load properly via new URL()
# but it helps with type checking
declare module '*.worker.ts' {
  const WorkerFactory: new () => Worker;
  export default WorkerFactory;
}
