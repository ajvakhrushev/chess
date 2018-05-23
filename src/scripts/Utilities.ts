export const clone = (data: any) => JSON.parse(JSON.stringify(data));

export interface objectAny {
  [key: string]: any;
};
