"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

type ChartData = {
  name: string;
  value?: number;
  delay?: number;
  initial?: number;
  remaining?: number;
};

type InventoryChartProps = {
  data: ChartData[];
  type: "bar" | "line" | "pie";
  title?: string;
};

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
];

export default function InventoryChart({
  data,
  type,
  title,
}: InventoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
        Không có dữ liệu để hiển thị biểu đồ
      </div>
    );
  }

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12 }}
          angle={-45}
          textAnchor="end"
          height={80}
        />
        <YAxis />
        <Tooltip
          formatter={(value, name) => [
            value,
            name === "value"
              ? "Số lượng còn lại"
              : name === "delay"
              ? "Số ngày delay"
              : name === "initial"
              ? "Số lượng ban đầu"
              : name,
          ]}
        />
        <Legend />

        {data[0]?.value !== undefined && (
          <Bar dataKey="value" fill="#8884d8" name="Số lượng còn lại" />
        )}

        {data[0]?.delay !== undefined && (
          <Bar dataKey="delay" fill="#82ca9d" name="Số ngày delay" />
        )}

        {data[0]?.initial !== undefined && (
          <Bar dataKey="initial" fill="#ffc658" name="Số lượng ban đầu" />
        )}
      </BarChart>
    </ResponsiveContainer>
  );

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />

        {data[0]?.remaining !== undefined && (
          <Line
            type="monotone"
            dataKey="remaining"
            stroke="#8884d8"
            strokeWidth={2}
            name="Số lượng còn lại"
          />
        )}

        {data[0]?.initial !== undefined && (
          <Line
            type="monotone"
            dataKey="initial"
            stroke="#82ca9d"
            strokeWidth={2}
            name="Số lượng ban đầu"
          />
        )}

        {data[0]?.delay !== undefined && (
          <Line
            type="monotone"
            dataKey="delay"
            stroke="#ff7300"
            strokeWidth={2}
            name="Số ngày delay"
          />
        )}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, value, percent }) =>
            `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
          }
          outerRadius={120}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [value, "Số lượng"]} />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    switch (type) {
      case "bar":
        return renderBarChart();
      case "line":
        return renderLineChart();
      case "pie":
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      {title && (
        <h3 className="text-lg font-semibold text-center mb-4 text-gray-800">
          {title}
        </h3>
      )}

      <div className="w-full">{renderChart()}</div>

      {/* Chart Info */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <strong>Tổng sản phẩm:</strong> {data.length}
          </div>
          <div>
            <strong>Tổng số lượng:</strong>{" "}
            {data.reduce(
              (sum, item) => sum + (item.value || item.remaining || 0),
              0
            )}
          </div>
          <div>
            <strong>Loại biểu đồ:</strong>{" "}
            {type === "bar" ? "Cột" : type === "line" ? "Đường" : "Tròn"}
          </div>
        </div>
      </div>
    </div>
  );
}
