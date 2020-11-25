import React, { useState } from "react";
import { AggData, Description } from "../App";

import INDICATOR_TABLE from "./indicator_table";
import LEGEND from "./legend";
import MED_FIELD from "./med_field";

export interface GraphData {
  agg_data: AggData;
  description: Description[];
}

export interface IndPerReg {
  registry_name: string;
  number_ind: number;
  indicators: Description[];
}

interface Props {
  data: GraphData;
  med_field: any;
  app_text: any;
  ind_per_reg: IndPerReg[];
  treatment_units: string[];
  selected_year: number;
  colspan: number;
  selected_row: any;
  update_selected_row(row: any): void;
  selection_bar_height: number | null;
  legend_height: any;
  update_legend_height(height: any): void;
}

const Main = (props: Props) => {
  const {
    data,
    med_field,
    app_text,
    ind_per_reg,
    treatment_units,
    selected_year,
    colspan,
    selected_row,
    update_selected_row,
    selection_bar_height,
    legend_height,
    update_legend_height,
  } = props;

  const all_reg = ind_per_reg.map((reg) => reg.registry_name);
  const [show_level_filter, update_show_level_filter] = useState(null);
  const [med_field_filter, update_med_field_filter] = useState(all_reg);
  const [clicked_med_field, update_clicked_med_field] = useState("all");

  return (
    <>
      <LEGEND
        app_text={app_text}
        update_show_level_filter={update_show_level_filter}
        show_level_filter={show_level_filter}
        selected_row={selected_row}
        update_selected_row={update_selected_row}
        selection_bar_height={selection_bar_height}
        update_legend_height={update_legend_height}
      />
      <div className="content_container">
        <div className="med_field_container">
          <MED_FIELD
            ind_per_reg={ind_per_reg}
            med_field={med_field}
            update_med_field_filter={update_med_field_filter}
            clicked_med_field={clicked_med_field}
            update_clicked_med_field={update_clicked_med_field}
            selected_row={selected_row}
            update_selected_row={update_selected_row}
            selection_bar_height={selection_bar_height}
            legend_height={legend_height}
          />
        </div>
        <div className="main_table_container">
          <INDICATOR_TABLE
            data={data}
            treatment_unit_name={treatment_units}
            treatment_year={selected_year}
            ind_per_reg={ind_per_reg}
            colspan={colspan}
            med_field_filter={med_field_filter}
            show_level_filter={show_level_filter}
            selected_row={selected_row}
            update_selected_row={update_selected_row}
            selection_bar_height={selection_bar_height}
            legend_height={legend_height}
          />
        </div>
      </div>
    </>
  );
};

export default Main;