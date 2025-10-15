import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

// Utility function to convert UPPER_SNAKE_CASE to Title Case
const toTitleCase = (str: string): string => {
  const exceptions = ['of', 'in', 'and', 'or', 'the', 'a', 'an', 'but', 'for', 'at', 'by', 'to'];
  
  return str
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w+/g, (word, index) => {
      // Always capitalize the first word, otherwise check if it's an exception
      if (index === 0 || !exceptions.includes(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      }
      return word;
    });
};

export default function ResponsivePieChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  // Transform the data to have title case labels
  const transformedData = data.map(item => ({
    ...item,
    label: toTitleCase(item.label)
  }));
  const colors = [
    {
      bg: "#8fdbc5",
      text: "black",
    },
    {
      bg: "#64adc4",
      text: "white",
    },
    {
      bg: "#4887b7",
      text: "white",
    },
    {
      bg: "#367096",
      text: "white",
    },
    {
      bg: "#f3fff0",
      text: "black",
    },
  ];

  return (
    <section className="h-full w-full flex flex-col gap-6">
      <ResponsiveContainer maxHeight={208}>
        <PieChart margin={{ top: 0, bottom: 0 }}>
          <Pie
            data={transformedData}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            outerRadius="100%"
            fill="#367096"
          >
            {transformedData.map((_, index) => (
              <Cell key={index} fill={colors[index % colors.length].bg} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: "16px" }} />
        </PieChart>
      </ResponsiveContainer>
      <section className="w-full flex flex-col gap-1">
        {transformedData.map((item, index) => (
          <div key={index} className="flex justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className="rounded-4xl h-4 w-4"
                style={{
                  background: `${colors[index % colors.length].bg}`,
                  border: `${
                    colors[index % colors.length].bg !== "#f3fff0"
                      ? "none"
                      : "1px solid " + colors[index % colors.length].text
                  }`,
                }}
              ></div>
              <span className="text-sm line-clamp-1">{item.label}</span>
            </div>
            <span className="text-sm font-bold">
              {(
                (item.value / transformedData.reduce((acc, curr) => acc + curr.value, 0)) *
                100
              ).toFixed(2)}
              %
            </span>
          </div>
        ))}
      </section>
    </section>
  );
}

