// Minimal typed declaration for `react-select-country-list`
declare module "react-select-country-list" {
  export type CountryOption = { value: string; label: string };

  // default export is a function that returns an object with at least getData()
  export default function countryList(): {
    getData: () => CountryOption[];
    // optional convenience helpers; remove or extend as you inspect the package
    getLabels?: () => string[];
    getValues?: () => string[];
  };
}
