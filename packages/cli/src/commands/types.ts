export type RTVAction = (...args: any[]) => unknown;
export type RTVOption = [string, string, any?];

export interface RTVCommand {
  command: string;
  description: string;
  action: RTVAction;
  options?: RTVOption[];
}
