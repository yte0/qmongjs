import {
  axisBottom,
  axisLeft,
  format,
  scaleBand,
  scaleLinear,
  select,
  max,
} from "d3";
import React, { useEffect, useRef } from "react";
import useDelayInitial from "../../utils/useDelayInitial";
import { Level } from "../TF_FIGURE/Chart";
import useResizeObserver from "../utils";
import styles from "./BarChart.module.css";

export interface Margin {
  top?: number;
  bottom?: number;
  right?: number;
  left?: number;
}

export interface DataPoint {
  label: string;
  value: number;
}
export interface Props {
  displayLevels: boolean;
  data: DataPoint[];
  levels: Level[];
  zoom?: boolean;
  margin?: Margin;
}

const MARGIN = { top: 0.05, bottom: 10, right: 0.15, left: 0.2 };

function BarChart(props: Props) {
  const { data, displayLevels, levels, zoom = false, margin = {} } = props;

  const delayedZoom = useDelayInitial(zoom, false);
  const svgRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const entry = useResizeObserver(wrapperRef);

  const height = Math.max(data.length * 50, 250);
  const width = entry?.contentRect.width ?? 0;

  const marginOffsets = {
    top: margin.top ?? MARGIN.top,
    right: (margin.right ?? MARGIN.right) * width,
    bottom: margin.bottom ?? MARGIN.bottom,
    left: (margin.left ?? MARGIN.left) * width,
  };

  const innerHeight = height - marginOffsets.top - marginOffsets.bottom;
  const innerWidth = width - marginOffsets.left - marginOffsets.right;

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    const svg = select(svgRef.current).selectChild<SVGGElement>();

    // Scales
    const yScale = scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, innerHeight])
      .padding(0.5);

    const xScaleDomain = getXScaleDomain(data, delayedZoom);

    const xScale = scaleLinear()
      .domain(xScaleDomain)
      .range([0, innerWidth])
      .clamp(true);

    // Y-Axis
    const yAxis = axisLeft(yScale);
    const yAxisElement = svg.select<SVGGElement>(".y-axis");
    yAxisElement.call(yAxis);
    yAxisElement.select(".domain").remove();
    yAxisElement.selectAll(".tick line").remove();
    yAxisElement.selectAll(".tick text").attr("font-size", "0.9rem");

    // X-Axis
    const xAxis = axisBottom(xScale)
      .tickSize(-innerHeight)
      .ticks(6)
      .tickFormat(format(",.0%"));
    const xAxisElement = svg.select<SVGGElement>(".x-axis");
    xAxisElement
      .style("transform", `translateY(${innerHeight}px)`)
      .transition()
      .duration(1000)
      .call(xAxis);
    xAxisElement.select(".domain").remove();
    xAxisElement.selectAll(".tick line").attr("stroke", "#D2D3D4");
    xAxisElement
      .selectAll(".tick text")
      .attr("fill", "#828586")
      .attr("font-size", "18.57px");

    // Levels
    svg
      .select(".levels")
      .selectAll(".level")
      .data(displayLevels ? levels : [])
      .join(
        (enter) =>
          enter
            .append("rect")
            .attr("class", "level")
            .attr("data-testid", ({ level }) => `level-${level}`)
            .attr("x", ({ end }) => xScale(end))
            .attr("y", 0)
            .attr("width", ({ start, end }) => xScale(start) - xScale(end))
            .attr("height", innerHeight)
            .attr("fill", ({ level }) => levelColor(level))
            .attr("opacity", 0.2),
        (update) =>
          update.call((update) =>
            update
              .transition()
              .duration(1000)
              .attr("x", ({ end }) => xScale(end))
              .attr("width", ({ start, end }) => xScale(start) - xScale(end))
          ),
        (exit) => exit.remove()
      );

    // Bars
    svg
      .select(".bars")
      .selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("data-testid", (d) => `bar-${d.label}`)
      .attr("x", 0)
      .attr("y", (d) => yScale(d.label) ?? 0)
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => barColor(d.label))
      .transition()
      .duration(1000)
      .attr("width", (d) => xScale(d.value));
  }, [data, displayLevels, levels, delayedZoom, innerHeight, innerWidth]);

  return (
    <div ref={wrapperRef}>
      <svg
        ref={svgRef}
        className={styles.barChart}
        height={marginOffsets.top + height + marginOffsets.bottom}
        width={marginOffsets.left + width + marginOffsets.right}
      >
        <g transform={`translate(${marginOffsets.left}, ${marginOffsets.top})`}>
          <g className="x-axis" />
          <g className="y-axis" />
          <g className="levels" />
          <g className="bars" />
        </g>
      </svg>
    </div>
  );
}

export default BarChart;

function levelColor(level: string) {
  switch (level) {
    case "high":
      return "#3baa34";
    case "mid":
      return "#fd9c00";
    case "low":
      return "#e30713";
    default:
      throw new Error(`${level} is not a valid level`);
  }
}

function barColor(label: String) {
  if (label === "Nasjonalt") {
    return "#00263D";
  }

  return "#7EBEC7";
}

function getXScaleDomain(data: DataPoint[], zoom: boolean): [number, number] {
  if (!zoom) {
    return [0, 1];
  }

  const xMaxVal = max(data, (d) => d.value) ?? 0;
  const additionalMargin = (0.01 + xMaxVal) * 0.2;
  const domainWidth = Math.ceil((xMaxVal + additionalMargin) * 100) / 100;

  return [0, Math.min(domainWidth, 1)];
}
