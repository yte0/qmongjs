import React from "react";
import { Meta, Story } from "@storybook/react/types-6-0";
import BarChart, { Props } from "../components/BarChart";

const meta: Meta = {
  title: "Charts/BarChart",
  component: BarChart,
};

const Template: Story<Props> = (args) => <BarChart {...args} />;

export const Primary = Template.bind({});
Primary.args = {
  displayLevels: false,
  data: [
    { label: "a", value: 1 },
    { label: "b", value: 0.15 },
    { label: "c", value: 0.3 },
    { label: "d", value: 0.1 },
  ],
  levels: {
    high: { start: 0.9, end: 1 },
    mid: { start: 0.5, end: 0.9 },
    low: { start: 0, end: 0.5 },
  },
};

export default meta;
