import { theme_table_chart_bar } from '../src/theme_table_chart_bar.js'
import { expect } from './utils.js'

describe('theme_table_chart_line object', function () {
  it('have the desired properties', function () {
    expect(theme_table_chart_bar).to.have.property('x_axis_label_fill')
    expect(theme_table_chart_bar).to.have.property('y_axis_label_fill')
    expect(theme_table_chart_bar).to.have.property('x_axis_label')
    expect(theme_table_chart_bar).to.have.property('y_axis_label')
    expect(theme_table_chart_bar).to.have.property('x_axis_label_font_family')
    expect(theme_table_chart_bar).to.have.property('y_axis_label_font_family')
    expect(theme_table_chart_bar).to.have.property('x_axis_tick_font_fill')
    expect(theme_table_chart_bar).to.have.property('y_axis_tick_font_fill')
    expect(theme_table_chart_bar).to.have.property('x_axis_tick_line_stroke')
    expect(theme_table_chart_bar).to.have.property('y_axis_tick_line_stroke')
    expect(theme_table_chart_bar).to.have.property('x_axis_domain_line_stroke')
    expect(theme_table_chart_bar).to.have.property('y_axis_domain_line_stroke')
  })
})
