import React, { useRef, useState } from "react";
import Card from "components/Card";
import CardIcon from "components/Card/CardIcon";
import CardBody from "components/Card/CardBody";
import CardFooter from "components/Card/CardFooter";
// *** Icons ***
import AssignmentIcon from "@mui/icons-material/Assignment";
import { Box, Button, Modal, Stack, Typography } from "@mui/material";
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

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const JobsReport = () => {
  const initialValues = { fromDate: initialDate, toDate: initialDate };
  const validationSchema = Yup.object({
    fromDate: dateValidation,
    toDate: dateValidation,
  });
  const formikRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  function downloadPdfFromByteArray(byteArray) {
    const blob = new Blob([byteArray], { type: "application/pdf" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "jobs_report.pdf";

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
      const response = await axios.post("/api/jobsReport", body, {
        headers,
        responseType: "arraybuffer",
      });

      if (!response) {
        handleOpen();
      } else {
        downloadPdfFromByteArray(response.data);
      }
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
       <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Warning ..
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            There Is No Data To View In This Date Range
          </Typography>
        </Box>
      </Modal>
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
                      labelText="From Date"
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
                      labelText="To Date"
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
                    {loading ? <Spinner size={17} /> : "Create Jobs Report"}
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

export default JobsReport;
