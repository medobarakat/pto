import React, { useRef, useState } from "react";
import Card from "components/Card";
import CardIcon from "components/Card/CardIcon";
import CardBody from "components/Card/CardBody";
import CardFooter from "components/Card/CardFooter";
// *** Icons ***
import AssignmentIcon from "@mui/icons-material/Assignment";
import { Button, Stack } from "@mui/material";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import axios from "axios";
import moment from "moment";
// *** components ***
import Spinner from "components/spinner";
import Datepicker from "components/FormFields/Datepicker/formik-date-picker";

const initialDate = moment(new Date()).format("MM/DD/YYYY").toString();

const dateValidation = Yup.date()
  .nullable()
  .typeError("Invalid Date.")
  .required("Required Field");

const AuditReport = () => {
  const initialValues = { fromDate: initialDate, toDate: initialDate };
  const validationSchema = Yup.object({
    fromDate: dateValidation,
    toDate: dateValidation,
  });
  const formikRef = useRef(null);
  const [loading, setLoading] = useState(false);

  function downloadPdfFromByteArray(byteArray) {
    const blob = new Blob([byteArray], { type: "application/pdf" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "audit_report.pdf";

    // Simulate a click event on the anchor to trigger the download
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();

    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const onSubmit = async ({ fromDate, toDate }) => {
    setLoading(true);

    const headers = { "Content-type": "application/json" };
    const body = {
      fromDate: moment(fromDate).format("YYYY-MM-DD"),
      toDate: moment(toDate).format("YYYY-MM-DD"),
    };

    try {
      const response = await axios.post("/api/auditReport", body, {
        headers,
        responseType: "arraybuffer",
      });

      downloadPdfFromByteArray(response.data);
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  // const onSubmit = async ({ fromDate, toDate }) => {
  //   setLoading(true);

  //   const headers = { "Content-type": "application/json" };
  //   const body = {
  //     fromDate: moment(fromDate).format("YYYY-MM-DD"),
  //     toDate: moment(toDate).format("YYYY-MM-DD"),
  //   };

  //   try {
  //     const response = await axios.post(
  //       "http://44.211.194.102:8084/auditReport",
  //       body,
  //       { headers, responseType: "arraybuffer" }
  //     );

  //     downloadPdfFromByteArray(response.data);
  //   } catch (error) {
  //     // Handle error
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <Card style={{ marginTop: 100 }}>
      <div className="card-icon-wrapper">
        <CardIcon color="primary">
          <AssignmentIcon sx={{ color: "#fff" }} />
        </CardIcon>
      </div>
      <CardBody>
        <Formik
          innerRef={formikRef}
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {(formik) => (
            <Form>
              <Stack direction="row" spacing={8}>
                <Field name="fromDate">
                  {({ field, form }) => (
                    <Datepicker
                      id="fromDate"
                      labelText="Date From"
                      fullWidth
                      onDateChange={() => console.log("changed")}
                      error={Boolean(
                        form.touched.fromDate && form.errors.fromDate
                      )}
                      helperText={
                        form.touched.fromDate && form.errors.fromDate
                          ? form.errors.fromDate
                          : ""
                      }
                      disabled={formik.isSubmitting}
                      setFieldTouched={formik.setFieldTouched}
                      {...formik.getFieldProps("fromDate")}
                    />
                  )}
                </Field>
                <Field name="toDate">
                  {({ field, form }) => (
                    <Datepicker
                      id="toDate"
                      labelText="Date To"
                      fullWidth
                      onDateChange={() => console.log("changed")}
                      error={Boolean(form.touched.toDate && form.errors.toDate)}
                      helperText={
                        form.touched.toDate && form.errors.toDate
                          ? form.errors.toDate
                          : ""
                      }
                      disabled={formik.isSubmitting}
                      setFieldTouched={formik.setFieldTouched}
                      {...formik.getFieldProps("toDate")}
                    />
                  )}
                </Field>
              </Stack>
              <Stack
                sx={{ diplay: "flex", alignItems: "center", marginTop: 4 }}
              >
                <Button sx={{ width: "20%" }} type="submit" variant="contained">
                  <span>
                    {loading ? <Spinner size={17} /> : "Create Audit Report"}
                  </span>
                </Button>
              </Stack>
            </Form>
          )}
        </Formik>
      </CardBody>
      <CardFooter />
    </Card>
  );
};

export default AuditReport;
