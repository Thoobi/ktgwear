import React, { useEffect, useState } from "react";
import { Formik, Form, Field, type FormikHelpers } from "formik";
import type { FieldProps } from "formik";
import * as Yup from "yup";
import { toast } from "sonner";
import CountrySelect from "./CountrySelect";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../../lib/supabase";

type Props = {
  onNext: () => void;
  shippingInfo: ShippingInfoType;
  setShippingInfo?: (info: ShippingInfoType) => void;
};

type ShippingInfoType = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip: string;
};

const ShippingInfo: React.FC<Props> = ({ onNext, shippingInfo }) => {
  const { setShippingInfo, setActiveTab } = useCart();
  const { userID } = useAuth();
  const [savedShipping, setSavedShipping] = useState<ShippingInfoType | null>(
    null
  );
  const [pendingSave, setPendingSave] = useState<ShippingInfoType | null>(null);
  const [saving, setSaving] = useState(false);
  const emailRegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  useEffect(() => {
    // helpful for debugging during development
    // console.log("Shipping Info Updated:", shippingInfo);
  }, [shippingInfo]);

  useEffect(() => {
    // try to load saved shipping info for authenticated user
    if (userID === null) return;
    const loadSaved = async () => {
      try {
        console.log("loadSaved(shipping form) userID:", userID);
        const { data, error } = await supabase
          .from("shippingInfo")
          .select("shipping_info, user_id, created_at")
          .eq("user_id", userID)
          .order("created_at", { ascending: false });
        console.log("shippingInfo query result (shipping form):", {
          data,
          error,
        });
        if (error) {
          console.error("fetchOrders error:", error);
          toast.error("Could not load your orders");
          return;
        }
        // data is an array of rows. pick the latest row and extract shipping_info if present.
        const rows = data as unknown as Array<Record<string, unknown>> | null;
        const latest = rows && rows.length ? rows[0] : null;
        const shippingPayload = latest ? latest.shipping_info ?? latest : null;
        setSavedShipping(shippingPayload as ShippingInfoType | null);
      } catch (err) {
        console.error("loadSaved shipping error:", err);
      }
    };

    void loadSaved();
  }, [userID]);

  const validationSchema = Yup.object({
    firstName: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string()
      .email("Invalid email")
      .matches(emailRegExp, "Invalid email format")
      .required("Email is required"),
    phone: Yup.string().required("Phone number is required"),
    address: Yup.string().required("Address is required"),
    city: Yup.string().required("City is required"),
    state: Yup.string().required("State is required"),
    country: Yup.string().required("Country is required"),
    zip: Yup.string().required("Zip code is required"),
  });

  return (
    <Formik<ShippingInfoType>
      initialValues={shippingInfo}
      enableReinitialize
      validationSchema={validationSchema}
      onSubmit={(
        values: ShippingInfoType,
        { setSubmitting }: FormikHelpers<ShippingInfoType>
      ) => {
        // store values and show in-form card instead of browser confirm
        try {
          setShippingInfo(values);
          setPendingSave(values);
        } catch (error) {
          console.error("Form submit error:", error);
          toast.error("Something went wrong");
        } finally {
          // stop Formik submitting — user will explicitly continue via the card
          setSubmitting(false);
        }
      }}
    >
      {({ errors, touched }) => (
        <Form className="flex flex-col gap-2 px-5">
          {/* Save prompt card shown after user submits the form */}
          {pendingSave && (
            <div className="mb-4 p-4 border bg-white shadow">
              <div className="flex items-start justify-between">
                <div className="pr-4">
                  <div className="text-sm font-medium">Save shipping info?</div>
                  <div className="text-xs text-gray-600">
                    Would you like to save these shipping details for next time?
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={saving}
                    className="px-3 py-1 bg-green-600 text-white cursor-pointer"
                    onClick={async () => {
                      if (!pendingSave) return;
                      setSaving(true);
                      try {
                        if (userID) {
                          const { error } = await supabase
                            .from("shippingInfo")
                            .upsert({
                              user_id: userID,
                              shipping_info: pendingSave,
                            });
                          if (error) {
                            console.error(
                              "Could not save shipping info:",
                              error
                            );
                            toast.error("Could not save shipping info.");
                            // fallback to local
                            localStorage.setItem(
                              "savedShippingInfo",
                              JSON.stringify(pendingSave)
                            );
                          } else {
                            toast.success(
                              "Shipping info saved to your profile."
                            );
                            setSavedShipping(pendingSave);
                          }
                        } else {
                          localStorage.setItem(
                            "savedShippingInfo",
                            JSON.stringify(pendingSave)
                          );
                          setSavedShipping(pendingSave);
                          toast.success("Shipping info saved locally");
                        }
                        // continue to next step
                        setActiveTab("PAYMENT");
                        onNext();
                      } catch (err) {
                        console.error("save shipping error:", err);
                        toast.error("Could not save shipping info");
                      } finally {
                        setSaving(false);
                        setPendingSave(null);
                      }
                    }}
                  >
                    Save
                  </button>

                  <button
                    type="button"
                    disabled={saving}
                    className="px-3 py-1 border cursor-pointer"
                    onClick={() => {
                      // don't save, just continue
                      setPendingSave(null);
                      setActiveTab("PAYMENT");
                      onNext();
                    }}
                  >
                    Don't Save
                  </button>
                </div>
              </div>
            </div>
          )}
          {savedShipping && (
            <div className="mb-4 p-3 border  bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-base font-medium">
                    Saved shipping info found
                  </div>
                  <div className="text-xs text-gray-600">
                    Use the saved address to prefill the form?
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="px-3 py-1 border text-sm cursor-pointer"
                    onClick={() => {
                      // populate form via context setter
                      setShippingInfo(savedShipping as ShippingInfoType);
                    }}
                  >
                    Use saved
                  </button>
                  <button
                    type="button"
                    className="px-3 py-1 border text-sm cursor-pointer"
                    onClick={() => {
                      // dismiss saved info for now (will still be available next time)
                      setSavedShipping(null);
                    }}
                  >
                    Ignore
                  </button>
                </div>
              </div>
            </div>
          )}
          <div className="flex w-full gap-3 items-start">
            <div className="flex flex-col w-full">
              <label className="text-lg">First Name</label>
              <Field
                type="text"
                id="firstName"
                name="firstName"
                placeholder="First Name"
                className={`border-2 border-gray-500 h-[45px] p-2 text-base w-[250px] focus:outline-none ${
                  errors.firstName && touched.firstName ? "border-red-500" : ""
                }`}
              />
              {errors.firstName && touched.firstName ? (
                <div className="text-red-500 font-medium text-xs before:content-['*'] before:text-red-500">
                  {errors.firstName}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col ">
              <label className="text-lg">Last Name</label>
              <Field
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Last Name"
                className={`border-2 border-gray-500 h-[45px] p-2 text-base w-[250px] focus:outline-none ${
                  errors.lastName && touched.lastName ? "border-red-500" : ""
                }`}
              />
              {errors.lastName && touched.lastName ? (
                <div className="text-red-500 font-medium text-xs before:content-['*'] before:text-red-500">
                  {errors.lastName}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex gap-3 w-full items-center">
            <div className="flex flex-col">
              <label htmlFor="email">Email</label>
              <Field
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                className={`border-2 border-gray-500 h-[45px] p-2 text-base w-[250px] focus:outline-none ${
                  errors.email && touched.email ? "border-red-500" : ""
                }`}
              />
              {errors.email && touched.email ? (
                <div className="text-red-500 font-medium text-xs before:content-['*'] before:text-red-500">
                  {errors.email}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col">
              <label>Phone</label>
              <Field
                type="text"
                id="phone"
                name="phone"
                placeholder="Phone"
                className={`border-2 border-gray-500 h-[45px] p-2 text-base w-[250px] focus:outline-none ${
                  errors.phone && touched.phone ? "border-red-500" : ""
                }`}
              />
              {errors.phone && touched.phone ? (
                <div className="text-red-500 font-medium text-xs before:content-['*'] before:text-red-500">
                  {errors.phone}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col w-full">
            <label>Address</label>
            <Field
              type="text"
              id="address"
              name="address"
              placeholder="Address"
              className={`border-2 border-gray-500 h-[45px] p-2 text-lg w-full focus:outline-none ${
                errors.address && touched.address ? "border-red-500" : ""
              }`}
            />
            {errors.address && touched.address ? (
              <div className="text-red-500 font-medium text-xs before:content-['*'] before:text-red-500">
                {errors.address}
              </div>
            ) : null}
          </div>

          <div className="flex gap-3 w-full justify-center items-center">
            <div className="flex flex-col">
              <label>Country</label>
              <Field name="country">
                {({ field, form }: FieldProps) => (
                  <CountrySelect
                    field={field}
                    form={form}
                    error={errors.country}
                    touched={touched.country}
                  />
                )}
              </Field>
              {errors.country && touched.country ? (
                <div className="text-red-500 font-medium text-xs before:content-['*'] before:text-red-500">
                  {errors.country}
                </div>
              ) : null}
            </div>

            <div className="flex flex-col">
              <label>Zip</label>
              <Field
                type="text"
                id="zip"
                name="zip"
                placeholder="Enter Zip Code"
                className={`border-2 border-gray-500 h-[45px] p-2 text-lg w-[250px] focus:outline-none ${
                  errors.zip && touched.zip ? "border-red-500" : ""
                }`}
              />
              {errors.zip && touched.zip ? (
                <div className="text-red-500 font-medium text-xs before:content-['*'] before:text-red-500">
                  {errors.zip}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex gap-3 w-full justify-center items-center">
            <div className="flex flex-col">
              <label>City</label>
              <Field
                type="text"
                id="city"
                name="city"
                placeholder="City"
                className={`border-2 border-gray-500 h-[45px] p-2 text-lg w-[250px] focus:outline-none ${
                  errors.city && touched.city ? "border-red-500" : ""
                }`}
              />
              {errors.city && touched.city ? (
                <div className="text-red-500 font-medium text-xs before:content-['*'] before:text-red-500">
                  {errors.city}
                </div>
              ) : null}
            </div>
            <div className="flex flex-col">
              <label>State</label>
              <Field
                type="text"
                id="state"
                name="state"
                placeholder="State"
                className={`border-2 border-gray-500 h-[45px] p-2 text-lg w-[250px] focus:outline-none ${
                  errors.state && touched.state ? "border-red-500" : ""
                }`}
              />
              {errors.state && touched.state ? (
                <div className="text-red-500 font-medium text-xs before:content-['*'] before:text-red-500">
                  {errors.state}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex justify-end items-center w-full">
            <button
              className="bg-black text-white w-[150px] h-[42px] cursor-pointer mt-5 text-lg"
              type="submit"
            >
              Proceed
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ShippingInfo;
