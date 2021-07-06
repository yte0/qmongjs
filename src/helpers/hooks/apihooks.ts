import { useQuery } from "react-query";
import { BarChartData } from "../../components/Charts/types";
import { API_HOST } from "../../components/RegisterPage";
interface FetchDescriptionParams {
  registerShortName: string;
  type?: "ind" | "dg";
}

const descriptionUrl = (params: FetchDescriptionParams): string => {
  const typeQuery: string = params.type ? `?type=${params.type}` : "";
  return `${API_HOST}/data/${params.registerShortName}/descriptions${typeQuery}`;
};

const fetchDescription = async (params: FetchDescriptionParams) => {
  const response = await fetch(descriptionUrl(params));
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response.json();
};

export const useDescriptionQuery = (params: FetchDescriptionParams) => {
  return useQuery(
    ["descriptions", params.registerShortName],
    () => fetchDescription(params),
    {
      staleTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * 60,
    }
  );
};

export interface FetchIndicatorParams {
  queryKey: string;
  registerShortName: string;
  treatmentYear?: number;
  unitNames?: string[];
  unitLevel?: string;
  context?: string;
  type?: string;
}

const indicatorUrl = (params: FetchIndicatorParams): string => {
  const unitQuery: string = params.unitNames
    ? params.unitNames.reduce((acc, cur) => {
        return `${acc}unit_name[]=${cur}&`;
      }, "")
    : "";
  const unitLevelQuery: string = params.unitLevel
    ? `unit_level=${params.unitLevel}&`
    : "";
  const contextQuery: string = params.context
    ? `context=${params.context}&`
    : "";
  const yearQuery: string = params.treatmentYear
    ? `year=${params.treatmentYear}&`
    : "";
  const typeQuery: string = params.type ? `type=${params.type}` : "";
  return `${API_HOST}/data/${params.registerShortName}/indicators?${unitQuery}${unitLevelQuery}${yearQuery}${contextQuery}${typeQuery}`;
};

const fetchIndicators = async (params: FetchIndicatorParams) => {
  const response = await fetch(indicatorUrl(params));
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
};

export const useIndicatorQuery = (params: FetchIndicatorParams) => {
  return useQuery<BarChartData[], Error>(
    [params.queryKey, params.registerShortName, params.context, params.type],
    () => fetchIndicators(params),
    {
      staleTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * 60,
    }
  );
};

const selectionYearsUrl = (
  registerShortName: string,
  context: string,
  type: string
): string => {
  return `${API_HOST}/data/${registerShortName}/years?context=${context}&type=${type}`;
};

const fetchSelectionYears = async (
  registerShortName: string,
  context: string,
  type: string
) => {
  const response = await fetch(
    selectionYearsUrl(registerShortName, context, type)
  );
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
};

export const useSelectionYearsQuery = (
  registerShortName: string,
  context: string,
  type: string
) => {
  return useQuery(
    ["selectionYears", registerShortName, context, type],
    () => fetchSelectionYears(registerShortName, context, type),
    {
      staleTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * 60,
    }
  );
};

const unitNamesUrl = (
  registerShortName: string,
  context: string,
  type: string
): string => {
  return `${API_HOST}/data/${registerShortName}/unitnames?context=${context}&type=${type}`;
};

const fetchUnitNames = async (
  registerShortName: string,
  context: string,
  type: string
) => {
  const response = await fetch(unitNamesUrl(registerShortName, context, type));
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
};

export const useUnitNamesQuery = (
  registerShortName: string,
  context: string,
  type: string
) => {
  return useQuery(
    ["unitNames", registerShortName, context, type],
    () => fetchUnitNames(registerShortName, context, type),
    {
      staleTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * 60,
    }
  );
};

const fetchRegisterNames = async () => {
  const response = await fetch(`${API_HOST}/info/names`);
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return await response.json();
};

export const useRegisterNamesQuery = () => {
  return useQuery(`registerNames`, () => fetchRegisterNames(), {
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    cacheTime: 1000 * 60 * 60,
  });
};

const fetchMedicalFields = async () => {
  const response = await fetch(`${API_HOST}/info/medicalfields`);
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json();
};

export const useMedicalFieldsQuery = () => {
  return useQuery(`medicalFields`, () => fetchMedicalFields(), {
    staleTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
    cacheTime: 1000 * 60 * 60,
  });
};
