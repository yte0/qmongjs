/**
 * To view a rendered version of all the snapshots:
 *
 * Copy the contents of ./__snapshots__/index.tsx.snap
 * Got to https://codesandbox.io/s/snapshot-viewer-nnmk3?file=/src/snapshots.js
 * Replace the contents with what you copied
 */
import { render, screen } from "@testing-library/react";
import React, { useRef } from "react";
import faker from "faker";
import BarChart, { Props, Bar } from "..";
import { useResizeObserver } from "../../../../helpers/hooks";
import { buildLevels } from "../../../../test/builders";
import { clockTick } from "../../../../test/clockTick";

jest.mock("../../../../helpers/hooks");
jest.mock("../../../../utils/useDelayInitial");

test("Bar have labels with value in %", async () => {
  const WIDTH = 500;
  (useResizeObserver as jest.Mock).mockReturnValue({
    contentRect: {
      width: WIDTH,
    },
  });
  const data = [
    { label: "a", value: 1 },
    { label: "b", value: 0.15 },
    { label: "c", value: 0.3 },
    { label: "d", value: 0.1 },
  ];
  render(
    <BarChartWithRef
      showLevel={true}
      data={data}
      levels={[
        { level: "high", start: 0.5, end: 0 },
        { level: "mid", start: 0.9, end: 0.5 },
        { level: "low", start: 1, end: 0.9 },
      ]}
      zoom={false}
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
    />
  );

  await clockTick(1500);

  for (const dataPoint of data) {
    const bar = screen.getByTestId(`bar-label-${dataPoint.label}`);
    const valueInPct = Math.round((dataPoint.value * 100 * 100) / 100) + "%";
    expect(bar.textContent).toBe(valueInPct);
  }
});

test("Bar widths are correct", async () => {
  const WIDTH = 500;
  (useResizeObserver as jest.Mock).mockReturnValue({
    contentRect: {
      width: WIDTH,
    },
  });

  const bar1 = buildBar({ value: 1 });
  const bar2 = buildBar({ value: 0.5 });

  const props = {
    ...buildProps({ data: [bar1, bar2] }),
    zoom: false,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
  };

  const { rerender } = render(<BarChartWithRef {...props} />);

  await clockTick(1500);

  for (const dataPoint of props.data) {
    const bar = screen.getByTestId(`bar-${dataPoint.label}`);
    const width = bar.getAttribute("width") ?? "";
    expect(parseFloat(width)).toBeCloseTo(dataPoint.value * WIDTH);
  }

  // Test bars update if values update
  const newProps = { ...props, data: [{ ...bar1, value: 0.75 }, bar2] };

  await rerender(<BarChartWithRef {...newProps} />);

  await clockTick(1500);

  for (const dataPoint of newProps.data) {
    const bar = screen.getByTestId(`bar-${dataPoint.label}`);
    const width = bar.getAttribute("width") ?? "";
    expect(parseFloat(width)).toBeCloseTo(dataPoint.value * WIDTH);
  }
});

test("Level widths are correct", async () => {
  const WIDTH = 500;
  (useResizeObserver as jest.Mock).mockReturnValue({
    contentRect: {
      width: WIDTH,
    },
  });

  const props = buildProps();

  render(
    <BarChartWithRef
      {...props}
      showLevel={true}
      zoom={false}
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
    />
  );

  await clockTick(1500);

  for (const l of props.levels) {
    const level = screen.getByTestId(`level-${l.level}`);
    const levelX = level.getAttribute("x") ?? "";
    expect(parseFloat(levelX)).toBeCloseTo(l.end * WIDTH);
    const levelWidth = level.getAttribute("width") ?? "";
    expect(parseFloat(levelWidth)).toBeCloseTo(l.start * WIDTH - l.end * WIDTH);
  }
});

test("Can set color and opacity for bars", async () => {
  const WIDTH = 500;
  (useResizeObserver as jest.Mock).mockReturnValue({
    contentRect: {
      width: WIDTH,
    },
  });

  const dataPoint1 = buildBar();
  const dataPoint2 = buildBar({ style: { color: "#00263D" } });
  const dataPoint3 = buildBar();
  const dataPoint4 = buildBar({
    style: { color: "#00263D", opacity: 0.5 },
  });

  const props = buildProps({
    data: [dataPoint1, dataPoint2, dataPoint3, dataPoint4],
  });

  render(
    <BarChartWithRef
      {...props}
      zoom={false}
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
    />
  );

  await clockTick(1500);

  expect(screen.getByTestId(`bar-${dataPoint1.label}`)).toHaveAttribute(
    "fill",
    "#7EBEC7"
  );
  expect(screen.getByTestId(`bar-${dataPoint2.label}`)).toHaveAttribute(
    "fill",
    dataPoint2.style?.color
  );
  expect(screen.getByTestId(`bar-${dataPoint3.label}`)).toHaveAttribute(
    "fill",
    "#7EBEC7"
  );
  expect(screen.getByTestId(`bar-${dataPoint4.label}`)).toHaveAttribute(
    "fill",
    dataPoint4.style?.color
  );
  expect(screen.getByTestId(`bar-${dataPoint4.label}`)).toHaveAttribute(
    "opacity",
    `${dataPoint4.style?.opacity}`
  );
});

test("Render without levels @250px", async () => {
  const WIDTH = 250;
  (useResizeObserver as jest.Mock).mockReturnValue({
    contentRect: {
      width: WIDTH,
    },
  });

  const { container } = render(
    <BarChartWithRef
      showLevel={false}
      data={[
        { label: "a", value: 1 },
        { label: "b", value: 0.15 },
        { label: "c", value: 0.3 },
        { label: "d", value: 0.1 },
      ]}
      levels={[
        { level: "high", start: 1, end: 0.09 },
        { level: "mid", start: 0.9, end: 0.5 },
        { level: "low", start: 0.5, end: 0 },
      ]}
      zoom={false}
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
    />
  );

  await clockTick(1500);

  expect(container).toMatchSnapshot();
});

test("Render with levels @250px", async () => {
  const WIDTH = 250;
  (useResizeObserver as jest.Mock).mockReturnValue({
    contentRect: {
      width: WIDTH,
    },
  });

  const { container } = render(
    <BarChartWithRef
      showLevel={true}
      data={[
        { label: "a", value: 1 },
        { label: "b", value: 0.15 },
        { label: "c", value: 0.3 },
        { label: "d", value: 0.1 },
      ]}
      levels={[
        { level: "high", start: 1, end: 0.9 },
        { level: "mid", start: 0.9, end: 0.5 },
        { level: "low", start: 0.5, end: 0 },
      ]}
      zoom={false}
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
    />
  );

  await clockTick(1500);

  expect(container).toMatchSnapshot();
});

test("Render without levels @500px", async () => {
  const WIDTH = 500;
  (useResizeObserver as jest.Mock).mockReturnValue({
    contentRect: {
      width: WIDTH,
    },
  });

  const { container } = render(
    <BarChartWithRef
      showLevel={false}
      data={[
        { label: "a", value: 1 },
        { label: "b", value: 0.15 },
        { label: "c", value: 0.3 },
        { label: "d", value: 0.1 },
      ]}
      levels={[
        { level: "high", start: 1, end: 0.9 },
        { level: "mid", start: 0.9, end: 0.5 },
        { level: "low", start: 0.5, end: 0 },
      ]}
      zoom={false}
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
    />
  );

  await clockTick(1500);

  expect(container).toMatchSnapshot();
});

test("Render with levels @500px", async () => {
  const WIDTH = 500;
  (useResizeObserver as jest.Mock).mockReturnValue({
    contentRect: {
      width: WIDTH,
    },
  });

  const { container } = render(
    <BarChartWithRef
      showLevel={true}
      data={[
        { label: "a", value: 1 },
        { label: "b", value: 0.15 },
        { label: "c", value: 0.3 },
        { label: "d", value: 0.1 },
      ]}
      levels={[
        { level: "high", start: 1, end: 0.9 },
        { level: "mid", start: 0.9, end: 0.5 },
        { level: "low", start: 0.5, end: 0 },
      ]}
      zoom={false}
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
    />
  );

  await clockTick(1500);

  expect(container).toMatchSnapshot();
});

test("Render with levels reversed @500px", async () => {
  const WIDTH = 500;
  (useResizeObserver as jest.Mock).mockReturnValue({
    contentRect: {
      width: WIDTH,
    },
  });

  const { container } = render(
    <BarChartWithRef
      showLevel={true}
      data={[
        { label: "a", value: 1 },
        { label: "b", value: 0.15 },
        { label: "c", value: 0.3 },
        { label: "d", value: 0.1 },
      ]}
      levels={[
        { level: "high", start: 0.5, end: 0 },
        { level: "mid", start: 0.9, end: 0.5 },
        { level: "low", start: 1, end: 0.9 },
      ]}
      zoom={false}
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
    />
  );

  await clockTick(1500);

  expect(container).toMatchSnapshot();
});

test("Render zoomed with levels @500px", async () => {
  const WIDTH = 500;
  (useResizeObserver as jest.Mock).mockReturnValue({
    contentRect: {
      width: WIDTH,
    },
  });

  const { container } = render(
    <BarChartWithRef
      showLevel={true}
      data={[
        { label: "a", value: 0.5 },
        { label: "b", value: 0.15 },
        { label: "c", value: 0.3 },
        { label: "d", value: 0.1 },
      ]}
      levels={[
        { level: "high", start: 1, end: 0.9 },
        { level: "mid", start: 0.9, end: 0.5 },
        { level: "low", start: 0.5, end: 0 },
      ]}
      zoom
      margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
    />
  );

  await clockTick(1500);

  expect(container).toMatchSnapshot();
});

// Helpers
function BarChartWithRef(props: Omit<Props, "svgContainerRef">) {
  const ref = useRef<HTMLDivElement>(null);
  return <BarChart {...props} svgContainerRef={ref} />;
}

// Builders
function buildBar(overrides?: Partial<Bar>): Bar {
  return {
    label: faker.datatype.uuid(),
    value: faker.datatype.number(100) / 100,
    ...overrides,
  };
}

function buildProps(
  overrides?: Partial<Props>
): Omit<Props, "svgContainerRef"> {
  return {
    showLevel: faker.datatype.boolean(),
    data: Array.from(
      { length: faker.datatype.number({ min: 1, max: 10 }) },
      buildBar
    ),
    levels: buildLevels(),
    zoom: faker.datatype.boolean(),
    ...overrides,
  };
}
