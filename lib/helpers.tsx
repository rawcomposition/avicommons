type Params = {
  [key: string]: string | number | boolean;
};

export const get = async (url: string, params: Params = {}) => {
  const cleanParams = Object.keys(params).reduce((accumulator: any, key) => {
    if (params[key]) accumulator[key] = params[key];
    return accumulator;
  }, {});

  const queryParams = new URLSearchParams(cleanParams).toString();

  let urlWithParams = url;
  if (queryParams) {
    urlWithParams += url.includes("?") ? `&${queryParams}` : `?${queryParams}`;
  }

  const res = await fetch(urlWithParams, {
    method: "GET",
  });

  let json: any = {};
  try {
    json = await res.json();
  } catch (error) {}
  if (!res.ok) {
    if (res.status === 404) throw new Error("Route not found");
    if (res.status === 405) throw new Error("Method not allowed");
    if (res.status === 504) throw new Error("Operation timed out. Please try again.");
    throw new Error(json.error || "An error ocurred");
  }
  return json;
};

export const generateRandomId = (length: number = 6) => {
  return Math.random()
    .toString()
    .slice(2, length + 2);
};
