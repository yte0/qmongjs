import React from "react";
import { useQueryParam } from "use-query-params";

interface Props {
  level: string;
  icon_class: string;
  legend_btn_class: string;
  update_show_level_filter: (p: string | null) => void | null;
  show_level_filter: string;
}

function LEGEND_BTN(props: Props) {
  const {
    level = "Høy måloppnåelse",
    icon_class = "fa fa-fas fa-circle",
    legend_btn_class = "high",
    update_show_level_filter,
    show_level_filter,
  } = props;
  const [, setLevelQP] = useQueryParam("level");
  const level_filter = legend_btn_class[0].toUpperCase();
  const checked_class = level_filter === show_level_filter ? "checked" : "";
  const handle_level_filter = (current_state: string, update_state: string) => {
    if (current_state === update_state) {
      update_show_level_filter(null);
      setLevelQP(undefined, "replace");
    } else {
      update_show_level_filter(update_state);
      setLevelQP(update_state);
    }
  };

  return (
    <button
      className={`${legend_btn_class} ${checked_class}`}
      onClick={() => handle_level_filter(show_level_filter, level_filter)}
    >
      <i className={`${icon_class} legend-icon`}> </i>
      <div className="legend-text">{level}</div>
    </button>
  );
}

export default LEGEND_BTN;
