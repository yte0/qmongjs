import React, { useCallback, useEffect } from "react";
import { UseQueryResult, useQueryClient } from "react-query";
import { Description, StatisticData } from "../../components/RegisterPage";

import BarChart, { Bar, BarStyle } from "../Charts/BarChart";
import LineChart, { DataPoint } from "../Charts/LineChart";
import { Level } from "../Charts/types";
import { useIndicatorQuery } from "../../helpers/hooks";

export interface Props {
  context: { context: string; type: string };
  svgContainerRef: React.RefObject<HTMLDivElement>;
  chartType: "bar" | "line";
  description: Description;
  treatmentYear: number;
  indicatorData: StatisticData[];
  zoom: boolean;
  showLevel: boolean;
  levels: Level[];
  selectedTreatmentUnits: string[];
}

function Chart(props: Props) {
  switch (props.chartType) {
    case "line":
      return <GetLineChart {...props} />;
    case "bar":
      return <GetBarChart {...props} />;
  }
}

export default Chart;

const GetBarChart: React.FC<Props> = (props) => {
  const { description, indicatorData, treatmentYear } = props;
  const queryClient = useQueryClient();
  const registerShortName = description.rname ?? "";
  const {
    isLoading,
    error,
    data: indQryData,
  } = useIndicatorQuery({
    queryKey: `indicatorDataBarChart`,
    registerShortName: registerShortName,
    unitLevel: "hospital",
    treatmentYear: treatmentYear,
    context: props.context.context,
    type: props.context.type,
  });

  const refetch = useCallback(() => {
    return queryClient.fetchQuery([
      "indicatorDataBarChart",
      registerShortName,
      props.context.context,
      props.context.type,
    ]);
  }, [
    queryClient,
    registerShortName,
    props.context.context,
    props.context.type,
  ]);

  useEffect(() => {
    refetch();
  }, [refetch, treatmentYear, props.context.context, props.context.type]);

  if (isLoading) return <>Loading...</>;
  if (error) return <>An error has occured: {error.message}</>;

  const filterData = (data: StatisticData[]) => {
    const filtered = data
      .filter(
        (data: StatisticData) =>
          !(
            data.ind_id !== props.description.id ||
            ((data.dg ?? 1) < 0.6 && data.unit_name !== "Nasjonalt") ||
            data.denominator < (description.min_denominator ?? 5)
          )
      )
      .map((data: StatisticData) => {
        const style: BarStyle = {};
        if (data.unit_name === "Nasjonalt") {
          style.color = "#00263D";
        } else {
          style.color = "#7EBEC7";
          if (props.selectedTreatmentUnits.length > 1) {
            style.opacity = unitNames.includes(data.unit_name) ? 1 : 0.5;
          }
        }
        return {
          label: data.unit_name,
          value: data.var,
          style,
        };
      })
      .sort((a: Bar, b: Bar) => b.value - a.value);
    return filtered ?? [];
  };

  const nasjonaltIndData = [...indicatorData].filter(
    (d) => d.unit_name === "Nasjonalt"
  );
  const barChartData = [...(indQryData ?? []), ...nasjonaltIndData];
  const unitNames = props.selectedTreatmentUnits;

  return <BarChart {...props} data={filterData(barChartData)} />;
};

const GetLineChart: React.FC<Props> = (props) => {
  const { description, selectedTreatmentUnits } = props;

  const queryClient = useQueryClient();
  const unitNameString = selectedTreatmentUnits.join();

  const registerShortName = description.rname ?? "";

  const lineChartQuery: UseQueryResult<any, unknown> = useIndicatorQuery({
    queryKey: `indicatorDatalineChart`,
    registerShortName: description.rname ?? "",
    unitNames: selectedTreatmentUnits,
    context: props.context.context,
    type: props.context.type,
  });
  const refetch = useCallback(() => {
    return queryClient.fetchQuery([
      "indicatorDatalineChart",
      registerShortName,
      props.context.context,
      props.context.type,
    ]);
  }, [
    queryClient,
    registerShortName,
    props.context.context,
    props.context.type,
  ]);

  useEffect(() => {
    refetch();
  }, [unitNameString, refetch, props.context.context, props.context.type]);

  const data: DataPoint[] = (lineChartQuery.data ?? [])
    .filter((data: StatisticData) => {
      return !(
        data.ind_id !== props.description.id ||
        ((data.dg ?? 1) < 0.6 && data.unit_name !== "Nasjonalt") ||
        data.denominator < (description.min_denominator ?? 5)
      );
    })
    .map((d: StatisticData) => ({
      label: d.unit_name,
      year: d.year,
      value: d.var,
    }));

  return <LineChart {...props} data={data} />;
};
