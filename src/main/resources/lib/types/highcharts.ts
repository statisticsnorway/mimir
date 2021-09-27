export interface HighchartsGraphConfig {
  accessibility?: {
    enabled?: boolean;
    keyboardNavigation?: {
      order?: Array<string>;
    };
    description?: string;
  };
  chart?: {
    height?: string;
    plotBorderColor?: string;
    spacingBottom?: number;
    plotBorderWidth?: number;
    style: HighchartsConfigStyle;
    type?: string;
    spacing?: Array<number>;
    zoomType?: string;
  };
  colors?: Array<string>;
  credits?: {
    position?: {
      align?: string;
        x?: number;
    };
    text?: string;
    href?: string;
    style?: HighchartsConfigStyle;
    enabled?: boolean;
  };
  exporting?: {
    chartOptions?: {
      credits?: {
        text?: string;
      };
    };
    buttons?: {
        contextButton?: {
          height?: number;
          symbolX?: number;
          symbolY?: number;
          theme?: {
            fill?: string;
              r?: number;
              'stroke-width'?: number;
              stroke?: string;
          };
          x?: number;
          width?: number;
          menuItems?: Array<string>;
        };
      };
    csv?: {
      itemDelimiter?: string;
    };
    enabled?: boolean;
  };
  legend?: {
    enabled?: boolean;
    align?: string;
    verticalAlign?: string;
    layout?: string;
    x?: number;
    y?: number;
    itemMarginBottom?: number;
    itemWidth?: number;
    itemStyle?: {
      color?: string;
      fontSize?: string;
      fontWeight?: string;
    };
    useHTML?: boolean;
  };
  plotOptions?: {
    pie?: {
      allowPointSelect?: boolean;
      minSize?: number;
      dataLabels?: {
      enabled?: boolean;
      style?: HighchartsConfigStyle;
    };
    showInLegend?: string;
  };
    series?: {
      marker?: {
        enabledThreshold?: number;
      };
      label?: {
        enabled?: boolean;
      };
      stacking?: string;
      states?: {
        hover?: {
          lineWidth?: number;
        };
      };
    };
  };
  series?: Array<HighchartsSeries>;
  subtitle: HighchartsConfigTitle;
  title: HighchartsConfigTitle;
  description: string;
  yAxis: HighchartsConfigAxis;
  xAxis?: HighchartsConfigAxis;
  tooltip?: {
    shadow?: boolean;
    backgroundColor?: string;
    valueDecimals?: string;
    shared?: string;
  };
  noData?: {
    style?: HighchartsConfigStyle;
  };
}

interface HighchartsSeries {
  type?: string;
}

interface HighchartsConfigTitle {
  align?: 'left' | 'center' | 'right';
  floating?: false;
  style?: HighchartsConfigStyle;
  margin?: number;
  text?: string;
  x?: number;
  y?: number;
  widthAdjust?: number;
  useHTML?: boolean;
  verticalAlign?: 'top' | 'middle' | 'bottom';
}

interface HighchartsConfigStyle {
  color?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  fontStretch?: string;
  width?: string;
}

interface HighchartsConfigAxis {
  reversed?: boolean;
  allowDecimals?: boolean;
  labels?: {
    enabled?: boolean;
    style?: HighchartsConfigStyle;
    format?: string;
  };
  max?: string;
  min?: string;
  stackLabels?: {
    enabled?: boolean;
    x?: number;
    y?: number;
  };
  tickmarkPlacement?: string;
  tickWidth?: number;
  tickColor?: string;
  tickInterval?: string;
  lineWidth?: number;
  lineColor?: string;
  title?: {
    style?: {
      color?: string;
    };
    text?: string;
    offset?: number;
    align?: string;
    rotation?: number;
    y?: number;
    x?: number;
  };
  type?: string;
}
