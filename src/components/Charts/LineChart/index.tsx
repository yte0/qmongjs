import {
  axisBottom,
  axisRight,
  format,
  group,
  line,
  scaleLinear,
  scaleOrdinal,
  scaleTime,
  select,
} from "d3";
import { useEffect, useRef, useState } from "react";
import { page_colors } from "../../../charts/page_colors";
import { theme_table_chart_line as theme } from "../../../charts/theme_table_chart_line";
import useDelayInitial from "../../../utils/useDelayInitial";
import { Level, Margin } from "../types";
import useResizeObserver from "../../utils";
import styles from "./LineChart.module.css";
import { levelColor } from "../utils";

export interface DataPoint {
  label: string;
  year: number;
  value: number;
}

export interface Props {
  svgContainerRef: React.RefObject<HTMLDivElement>;
  showLevel: boolean;
  data: DataPoint[];
  levels: Level[];
  zoom?: boolean;
  margin?: Margin;
}

const MARGIN = { top: 8, bottom: 34, right: 0.15, left: 0.1 };

const LineChart = (props: Props) => {
  const {
    svgContainerRef,
    data,
    showLevel: displayLevels,
    levels,
    zoom = false,
    margin = {},
  } = props;

  const [hoveredLegend, setHoveredLegend] = useState<string | null>(null);
  const [selectedLegends, setSelectedLegends] = useState<string[]>([]);
  const delayedZoom = useDelayInitial(zoom, false);
  const legendContainerRef = useRef(null);
  const entry = useResizeObserver(svgContainerRef);

  const width = entry?.contentRect.width ?? 0;
  const height = width / 2;

  const [legendHeight, setLegendHeight] = useState<number>(0);

  const marginOffsets = {
    top: margin.top ?? MARGIN.top,
    right: (margin.right ?? MARGIN.right) * width,
    bottom: margin.bottom ?? MARGIN.bottom,
    left: (margin.left ?? MARGIN.left) * width,
  };

  const innerHeight = height - marginOffsets.top - marginOffsets.bottom;
  const innerWidth = width - marginOffsets.left - marginOffsets.right;

  useEffect(() => {
    if (innerWidth === 0) {
      return;
    }

    const container = select(svgContainerRef.current);

    // Scales
    const pathLabels = Array.from(
      new Set(data.map((d) => d.label))
    ).map((d) => ({ label: d, width: 0 }));
    const lineColorScale = scaleOrdinal<string>()
      .domain(pathLabels.map((d) => d.label))
      .range(page_colors.chart_colors);

    const minYear = Math.min(...data.map((d) => d.year));
    const maxYear = Math.max(...data.map((d) => d.year));
    const xScale = scaleTime()
      .domain([minYear, maxYear])
      .range([0, innerWidth]);

    const yScaleDomain = getYScaleDomain(data, delayedZoom);
    const yScale = scaleLinear()
      .domain(yScaleDomain)
      .range([innerHeight, 0])
      .clamp(true);

    // Legend
    let highlightedLegends = selectedLegends;

    if (hoveredLegend) {
      highlightedLegends = Array.from(
        new Set([...selectedLegends, hoveredLegend])
      );
    }

    select(legendContainerRef.current)
      .selectAll("g")
      .data(pathLabels, (d: any) => d.label)
      .join(
        (enter) =>
          enter
            .append("g")
            .attr("opacity", 0)
            .attr("class", (d: { label: string }) => d.label)
            .append("text")
            .text((d: { label: string }) => d.label)
            .attr("fill", theme.legend_text_fill)
            .style("font-family", theme.legend_text_font_family)
            .attr("dy", ".35em"),
        (update) => update,
        (exit) => exit.remove()
      );
    const nextItemPosition: { x: number; y: number } = { x: 0, y: 0 };

    select(legendContainerRef.current)
      .selectAll("g")
      .selectAll("line")
      .data((d: any) => {
        return [d.label];
      })
      .join(
        (enter) =>
          enter
            .append("line")
            .attr("x1", "0")
            .attr("y1", "15px")
            .attr("y2", "15px")
            .attr("x2", function (d: any) {
              const curElem: any = this!;
              const width: number = curElem.parentNode.getBoundingClientRect()
                .width;
              return width;
            }),
        (update) => update.attr("stroke", (d: any) => lineColorScale(d)),
        (exit) => exit.remove()
      )
      .attr("stroke-width", "4px")
      .attr("stroke", (d: any) => lineColorScale(d))
      .style("stroke-linecap", "round");

    select(legendContainerRef.current)
      .selectAll("g")
      .attr("transform", function (d, i) {
        const curElem: any = this!;
        const selectedElem: any = select(curElem);
        const bbox = selectedElem.node().getBoundingClientRect();
        const space: number = 20;

        nextItemPosition.y =
          nextItemPosition.x + bbox.width + space < innerWidth
            ? nextItemPosition.y
            : nextItemPosition.y + bbox.height + space;
        nextItemPosition.x =
          nextItemPosition.x + bbox.width + space < innerWidth
            ? nextItemPosition.x + bbox.width + space
            : bbox.width + space;

        return `translate(${
          nextItemPosition.x - bbox.width - space
        }, ${nextItemPosition.y})`;
      })
      .attr("opacity", (d: any) => {
        if (selectedLegends.length === 0) {
          return 1;
        }
        return selectedLegends.includes(d.label) ? 1 : 0.4;
      })
      .style("cursor", "pointer")
      .on("mouseover", (_e, d: any) => {
        setHoveredLegend(d.label);
      })
      .on("mouseout", (_e, d: any) => {
        setHoveredLegend((current) => (current === d.label ? null : current));
      })
      .on("click", (_e, d: any) => {
        setHoveredLegend((current) => (current === d.label ? null : current));
        setSelectedLegends((selected) => {
          if (selected.includes(d.label)) {
            return selected.filter((s) => s !== d.label);
          }

          return [...selected, d.label];
        });
      });
    setLegendHeight(nextItemPosition.y + 40);

    // Y-Axis
    const yAxisFormat =
      yScaleDomain[1] - yScaleDomain[0] < 0.06 ? ",.1%" : ",.0%";
    const yAxis = axisRight(yScale)
      .ticks(theme.y_axis_tick_number)
      .tickSize(innerWidth)
      .tickFormat(format(yAxisFormat));
    const yAxisElement = container.select<SVGGElement>(".y-axis");
    yAxisElement.transition().duration(1000).call(yAxis);
    yAxisElement.select(".domain").remove();
    yAxisElement
      .selectAll(".tick line")
      .attr("stroke", theme.y_axis_tick_line_stroke);
    yAxisElement
      .selectAll(".tick text")
      .style("font-size", `${8 + innerHeight * 0.02}px`)
      .attr("fill", theme.y_axis_tick_font_fill);

    // X-Axis
    let years = Array.from(new Set(data.map((d) => d.year)));
    if (years.length > 8) {
      years =
        years.length % 2 === 0
          ? years.filter((_, i) => i % 2 !== 0)
          : years.filter((_, i) => i % 2 === 0);
    }

    const xAxis = axisBottom(xScale)
      .tickValues(years)
      .tickFormat((d) => `${d}`);
    const xAxisElement = container.select<SVGGElement>(".x-axis");
    xAxisElement.call(xAxis);
    xAxisElement.select(".domain").remove();
    xAxisElement.selectAll(".tick line").remove();
    xAxisElement
      .selectAll(".tick text")
      .style("font-size", `${10 + innerWidth * 0.015}px`)
      .attr("fill", theme.x_axis_tick_font_fill)
      .attr("y", 5 + innerHeight * 0.08);

    // Levels
    container
      .select(".levels")
      .selectAll(".level")
      .data(displayLevels ? levels : [])
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("class", "level")
            .attr("data-testid", ({ level }) => `level-${level}`)
            .attr("x", 0)
            .attr("y", (d) => yScale(d.start))
            .attr("width", innerWidth)
            .attr(
              "height",
              ({ start, end }) =>
                innerHeight - yScale(start) - (innerHeight - yScale(end))
            )
            .attr("fill", ({ level }) => levelColor(level))
            .attr("opacity", 0.2),
        (update) =>
          update.call((update) =>
            update
              .transition()
              .duration(1000)
              .attr("y", (d) => yScale(d.start))
              .attr(
                "height",
                ({ start, end }) =>
                  innerHeight - yScale(start) - (innerHeight - yScale(end))
              )
          ),
        (exit) => exit.remove()
      );

    // Paths
    const lines = line<DataPoint>()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.value));
    container
      .select(".lines")
      .selectAll(".line")
      .data(group(data, (d) => d.label))
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("class", "line")
            .attr("stroke", ([label]) => lineColorScale(label))
            .style("stroke-width", 3)
            .style("stroke-linejoin", "round")
            .style("stroke-linecap", "round")
            .attr("fill", "none")
            .style("mix-blend-mode", "multiply")
            .attr("d", ([, d]) => lines(d)),
        (update) =>
          update.call((update) =>
            update
              .attr("opacity", ([label]) => {
                if (highlightedLegends.length === 0) {
                  return 1;
                }
                return highlightedLegends.includes(label) ? 1 : 0.4;
              })
              .transition()
              .duration(1000)
              .attr("d", ([, d]) => lines(d))
          ),
        (exit) => exit.remove()
      );
  }, [
    data,
    delayedZoom,
    displayLevels,
    hoveredLegend,
    innerHeight,
    innerWidth,
    levels,
    selectedLegends,
    svgContainerRef,
    setLegendHeight,
  ]);

  return (
    <div>
      <div ref={svgContainerRef}>
        <svg
          className={styles.lineChart}
          height={
            marginOffsets.top + legendHeight + height + marginOffsets.bottom
          }
          width={marginOffsets.left + width + marginOffsets.right}
        >
          <g
            ref={legendContainerRef}
            transform={`translate(${marginOffsets.left}, ${marginOffsets.top})`}
          ></g>
          <g
            transform={`translate(${marginOffsets.left}, ${
              marginOffsets.top + legendHeight
            })`}
          >
            <g className="x-axis" transform={`translate(0, ${innerHeight})`} />
            <g className="y-axis">
              <text
                fill={theme.y_axis_label_fill}
                transform="rotate(-90)"
                x={-innerHeight / 1.5}
                y={innerWidth * 1.15}
                style={{
                  fontSize: `${7 + innerWidth * 0.02}px`,
                  fontFamily: theme.y_axis_label_font_family,
                }}
              >
                {theme.y_axis_label}
              </text>
            </g>
            <g className="levels" />
            <g className="lines" />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default LineChart;

function getYScaleDomain(data: DataPoint[], zoom: boolean): [number, number] {
  if (!zoom) {
    return [0, 1];
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));

  const additionalMargin = (maxValue - minValue) * 0.2;
  const yMin = Math.floor((minValue - additionalMargin) * 100) / 100;
  const yMax = Math.ceil((maxValue + additionalMargin) * 100) / 100;

  return [Math.max(yMin, 0), Math.min(yMax, 1)];
}
