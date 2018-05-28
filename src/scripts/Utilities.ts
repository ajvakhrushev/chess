export const clone = (data: any) => JSON.parse(JSON.stringify(data));

export interface objectAny {
  [key: string]: any;
};

export const getQueryParams = () => {
  return window.location.search.substring(1).split('&').map((next: string) => {
    const data = next.split('=');

    return {key: data[0], value: data[1]};
  });
};