import { useMemo } from "react";
import countryList from "react-select-country-list";

type Option = { value: string; label: string };

type CountrySelectProps = {
  field?: { name?: string; value?: string | null };
  form?: {
    setFieldValue?: (name: string, value: string | null) => void;
    setFieldTouched?: (name: string, touched: boolean) => void;
  };
  error?: string;
  touched?: boolean;
};

const CountrySelect = ({
  field = {},
  form = {},
  error,
  touched,
}: CountrySelectProps) => {
  const options = useMemo(() => countryList().getData() as Option[], []);

  const handleChange = (value: string) => {
    if (field.name && form.setFieldValue) {
      form.setFieldValue(field.name, value);
    }
  };

  return (
    <div>
      <select
        name={field.name}
        value={field.value ?? ""}
        onChange={(e) => handleChange(e.target.value)}
        className="border-2 border-gray-500  px-2 py-2.5 w-[250px]"
      >
        <option value="">Select a country</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && touched ? (
        <div className="text-red-500 text-sm">{error}</div>
      ) : null}
    </div>
  );
};

export default CountrySelect;
