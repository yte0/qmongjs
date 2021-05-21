import React, { useEffect, useMemo, useCallback, memo } from "react";
import { UseQueryResult, useQueryClient } from "react-query";
import { useQueryParam } from "use-query-params";
import { mainQueryParamsConfig } from "../../../../app_config";

import style from "./tableblock.module.css";
import {
  useDescriptionQuery,
  useIndicatorQuery,
} from "../../../../helpers/hooks";
import {
  filterOrderIndID,
  validateTreatmentUnits,
} from "../../../../helpers/functions";
import { IndicatorRow } from "../indicatorrow";
import { TableBlockTitle } from "./tableblocktitle";
import { Description, StatisticData } from "../../";

interface RegisterName {
  id: number;
  rname: string;
  full_name: string;
  registerField?: string;
}

export interface TableBlockProps {
  tableType: "allRegistries" | "singleRegister";
  optstu: [];
  registerName: RegisterName;
  blockTitle?: string;
  treatmentYear: number;
  unitNames: string[];
  trRegisterNameClass?: string;
  medicalFieldFilter: string[];
  showLevelFilter: string;
  colspan: number;
}

export const TableBlock: React.FC<TableBlockProps> = (props) => {
  const {
    tableType,
    optstu,
    registerName,
    colspan,
    trRegisterNameClass = "register-row",
    treatmentYear,
    medicalFieldFilter,
    showLevelFilter,
    blockTitle,
  } = props;

  const [treatment_units] = useQueryParam(
    "selected_treatment_units",
    mainQueryParamsConfig.selected_treatment_units
  );
  const unitNames = React.useMemo(() => {
    return [
      ...validateTreatmentUnits(treatment_units as string[], optstu),
      "Nasjonalt",
    ];
  }, [treatment_units, optstu]);
  const queryClient = useQueryClient();

  const indicatorDataQuery: UseQueryResult<any, unknown> = useIndicatorQuery({
    queryKey: "indicatorData",
    registerShortName: registerName.rname,
    unitNames,
    treatmentYear,
  });

  const descriptionQuery: UseQueryResult<any, unknown> = useDescriptionQuery({
    registerShortName: registerName.rname,
    type: "ind",
  });

  const isFetching = queryClient.getQueryState([
    "indicatorData",
    registerName.rname,
  ])?.isFetching;

  const refetch = useCallback(() => {
    return queryClient.fetchQuery(["indicatorData", registerName.rname]);
  }, [queryClient, registerName.rname]);

  useEffect(() => {
    refetch();
  }, [unitNames, refetch, treatmentYear]);

  const uniqueOrderedInd: string[] = useMemo(
    () =>
      filterOrderIndID(
        isFetching ?? false,
        unitNames,
        indicatorDataQuery.data ?? [],
        descriptionQuery.data ?? [],
        showLevelFilter,
        tableType
      ),
    [
      tableType,
      isFetching,
      unitNames,
      descriptionQuery.data,
      indicatorDataQuery.data,
      showLevelFilter,
    ]
  );

  if (descriptionQuery.isLoading || indicatorDataQuery.isLoading) {
    return null;
  }

  if (
    descriptionQuery.data.length === 0 ||
    indicatorDataQuery.data.length === 0
  ) {
    return null;
  }

  const medicalFieldClass = medicalFieldFilter.includes(registerName.rname)
    ? ""
    : style.filterMedField;

  const indicatorRows = uniqueOrderedInd.map((indicator) => {
    const singleIndicatorData = indicatorDataQuery.data.filter(
      (data: StatisticData) => data.ind_id === indicator
    );
    const singleIndicatorDescription = descriptionQuery.data.filter(
      (data: Description) => data.id === indicator
    );
    return (
      <IndicatorRow
        indicatorData={singleIndicatorData}
        description={singleIndicatorDescription[0]}
        key={indicator}
        unitNames={unitNames}
        medicalFieldClass={medicalFieldClass}
        showLevelFilter={showLevelFilter}
        colspan={colspan}
        treatmantYear={treatmentYear}
      />
    );
  });

  return (
    <>
      {blockTitle && uniqueOrderedInd.length !== 0 ? (
        <TableBlockTitle
          title={blockTitle}
          colspan={colspan}
          tr_register_name_class={`${trRegisterNameClass} ${registerName.rname} ${medicalFieldClass}`}
        />
      ) : null}
      {indicatorRows}
    </>
  );
};

export default memo(TableBlock);
