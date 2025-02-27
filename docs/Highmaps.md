# Highmaps

A highmap is a highchart with a map config.

## Continous (kontinuerlige) vs discrete (diskrete)

A highmap is discrete if the series name is show in the legend, and each series is show. It is continous if the values are shown in the lengend, as a set of thresholds or range. What type the map ends up as is dependent on if the [colorAxis](https://api.highcharts.com/highmaps/colorAxis) field is set in the config. "A color axis for series. Visually, the color axis will appear as a gradient or as separate items inside the legend, depending on whether the axis is scalar or based on data classes." So if colorAxis is set it is continous. 

In our highmap config we set colorAxis if threshold values are set or if the gradient color option is chosen.