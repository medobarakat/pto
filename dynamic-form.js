import React, { memo, useMemo, useEffect, useContext } from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import { Formik, Form, Field } from "formik";
import { FormControl, Grid, InputLabel, MenuItem, Stack } from "@mui/material";
// *** components ***
import CustomInput from "components/FormFields/CustomInput";
import CustomButton from "components/FormFields/CustomButton";
import IOSSwitch from "components/FormFields/CustomSwitch/IOSSwitch";
import CustomRadioGroup from "components/FormFields/CustomRadioGroup";
import Datepicker from "components/FormFields/Datepicker/formik-date-picker";
// *** modals ***
import PromptLeavingDialog from "shared/modals/accept-reject.dialog";
// *** context ***
import { AnalysisNavigatingAwayContext } from "components/views/analysis/tabAnalysis";
import { ExceptionsNavigatingAwayContext } from "views/exceptions";
import { AddExceptionNavigatingAwayContext } from "views/add-exception";
import { Select } from "formik-mui";
import CustomDropdown from "components/FormFields/CustomDropdown";

const DynamicForm = React.forwardRef(
  (
    {
      viewType,
      formId,
      valueTypes,
      hardReload,
      initialValues,
      validationSchema,
      onSubmit,
      formFields,
    },
    ref
  ) => {
    const SelectedNavAwayContext = useMemo(() => {
      switch (viewType) {
        case "exception":
          return ExceptionsNavigatingAwayContext;
        case "add-exception":
          return AddExceptionNavigatingAwayContext;
        default:
          return AnalysisNavigatingAwayContext;
      }
    }, [viewType]);

    const {
      canShowDialogLeavingPage,
      showDialogLeavingPage,
      cancelNavigation,
      confirmNavigation,
      setCanShowDialogLeavingPage,
      setHardReload,
    } = useContext(SelectedNavAwayContext);

    useEffect(() => {
      if (hardReload) {
        setCanShowDialogLeavingPage(false);
        if (viewType === "exception" || viewType === "add-exception") {
          setHardReload(true);
        }
        setTimeout(() => {
          window.location.reload();
        }, 200);
      }
    }, [hardReload]);

    const onReset = () =>
      new Promise(function (resolve, reject) {
        // eslint-disable-next-line no-restricted-globals
        const userChoice = confirm(
          `would you like to reset form (${formId}) ?`
        );
        if (userChoice === true) {
          setCanShowDialogLeavingPage(false);
          resolve();
        } else reject();
      });

    const handleFormChange = (dirty, event) => {
      if (dirty && !canShowDialogLeavingPage) setCanShowDialogLeavingPage(true);
    };

    return (
      <Formik
        innerRef={ref}
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => onSubmit(values, { formId, valueTypes })}
        onReset={onReset}
      >
        {(formik) => {
          return (
            <>
              <PromptLeavingDialog
                title="Do you want to leave this page?"
                description="Changes you made may not be saved."
                confirmButtonTitle="Leave"
                cancelButtonTitle="Stay"
                open={showDialogLeavingPage}
                onClose={() => setCanShowDialogLeavingPage(false)}
                onAccept={confirmNavigation}
                onReject={cancelNavigation}
                fullWidth
              />

              <Form
                //! CAUTION:
                //! please keep dirty (true) here onChange Form. We will not take (formik.dirty) because it returns (false) on first change
                //! by default but our plan is to make it dirty on any change even if we have one change!!!
                onChange={(event) => handleFormChange(true, event)}
                onSubmit={formik.handleSubmit}
              >
                <Grid container columnSpacing={3} rowSpacing={1}>
                  {formFields.map(
                    (
                      { id, name, type, value, options, required, choices },
                      Idx
                    ) => {
                      if (choices && type === "text") {
                        return (
                          <Grid key={`grid-${name}`} item md={6}>
                            <Field name={name}>
                              {({ field, form, meta }) => {
                                const handleChange = (e) => {
                                  form.setFieldValue(name, e.target.value);
                                };
                                return (
                                  <CustomDropdown
                                    id={id}
                                    label={name}
                                    name={name}
                                    items={choices}
                                    dynamicItem={true}
                                    value={field.value || value}
                                    onChange={handleChange}
                                  />
                                );
                              }}
                            </Field>
                          </Grid>
                        );
                      } else {
                        switch (type) {
                          case "readonly":
                          case "readonly-text":
                          case "text":
                          case "multi-line-text":
                            const otherTextfieldProps = {};

                            if (
                              (type === "readonly" ||
                                type === "readonly-text") &&
                              value === ""
                            ) {
                              _.assign(otherTextfieldProps, { shrink: false });
                            }

                            if (type === "multi-line-text") {
                              _.assign(otherTextfieldProps, {
                                multiline: true,
                                minRows: 4,
                                maxRows: 6,
                              });
                            }

                            return (
                              <Grid key={`grid-${name}`} item md={6}>
                                <Field name={id}>
                                  {({
                                    field,
                                    form,
                                    meta: { touched, error },
                                  }) => (
                                    <CustomInput
                                      key={`form-textField-${id}`}
                                      labelText={name}
                                      error={Boolean(touched && error)}
                                      helperText={
                                        Boolean(touched && error) ? error : ""
                                      }
                                      // error={Boolean(formik.touched?.[id] && formik.errors?.[id])}
                                      // helperText={formik.touched?.[id] && formik.errors?.[id] ? formik.errors?.[id] : ""}
                                      required={required}
                                      fullWidth
                                      margin="normal"
                                      disabled={formik.isSubmitting}
                                      readOnly={Boolean(
                                        type === "readonly" ||
                                          type === "readonly-text"
                                      )}
                                      {...field}
                                      {...otherTextfieldProps}
                                    />
                                  )}
                                </Field>
                              </Grid>
                            );
                          case "radio-buttons":
                            return (
                              <Grid key={`grid-${name}`} item md={6}>
                                <Field name={id}>
                                  {({ field, form, meta }) => {
                                    return (
                                      <CustomRadioGroup
                                        name={id}
                                        value={field.value}
                                        formLabel={name}
                                        direction="row"
                                        size="small"
                                        labelPlacement="end"
                                        margin="normal"
                                        required={required}
                                        fullWidth
                                        defaultValue={value}
                                        disabled={formik.isSubmitting}
                                        onChange={field.onChange}
                                        options={options.map(
                                          ({ id, name }) => ({
                                            id,
                                            label: name,
                                            value: id,
                                          })
                                        )}
                                        error={Boolean(
                                          meta.touched && meta.error
                                        )}
                                        helperText={
                                          Boolean(meta.touched && meta.error)
                                            ? meta.error
                                            : ""
                                        }
                                      />
                                    );
                                  }}
                                </Field>
                              </Grid>
                            );
                          case "boolean":
                            return (
                              <Grid key={`grid-${name}`} item md={6}>
                                <Field name={id}>
                                  {({ field, form, meta }) => (
                                    <IOSSwitch
                                      key={`form-switch-${id}`}
                                      name={id}
                                      label={name}
                                      checked={Boolean(field.value)}
                                      disabled={formik.isSubmitting}
                                      required={required}
                                      error={Boolean(
                                        formik.touched?.[id] &&
                                          formik.errors?.[id]
                                      )}
                                      helperText={
                                        formik.touched?.[id] &&
                                        formik.errors?.[id]
                                          ? formik.errors?.[id]
                                          : ""
                                      }
                                      onChange={field.onChange}
                                    />
                                  )}
                                </Field>
                              </Grid>
                            );
                          case "date":
                            return (
                              <Grid key={`grid-${name}`} item md={6}>
                                <Field name={id}>
                                  {({ field, form, meta }) => {
                                    return (
                                      <div
                                        style={{
                                          marginTop: 15,
                                          marginBottom: 8,
                                        }}
                                      >
                                        <Datepicker
                                          id={id}
                                          labelText={name}
                                          fullWidth
                                          dynamicForm
                                          error={Boolean(
                                            formik.touched?.[id] &&
                                              formik.errors?.[id]
                                          )}
                                          helperText={
                                            formik.touched?.[id] &&
                                            formik.errors?.[id]
                                              ? formik.errors?.[id]
                                              : ""
                                          }
                                          disabled={formik.isSubmitting}
                                          setFieldTouched={
                                            formik.setFieldTouched
                                          }
                                          handleFormChange={handleFormChange}
                                          {...field}
                                        />
                                      </div>
                                    );
                                  }}
                                </Field>
                              </Grid>
                            );
                          default:
                            break;
                        }
                      }
                    }
                  )}
                </Grid>

                <Stack sx={{ mt: 2 }} direction="row" spacing={3}>
                  <CustomButton
                    type="submit"
                    innerContent={
                      formik.isSubmitting ? "Please Wait..." : "Save"
                    }
                    variant="contained"
                    color="primary"
                    disabled={formik.isSubmitting}
                  />

                  <CustomButton
                    type="reset"
                    innerContent="Reset"
                    variant="outlined"
                    color="primary"
                    disabled={formik.isSubmitting}
                  />
                </Stack>
              </Form>
            </>
          );
        }}
      </Formik>
    );
  }
);

DynamicForm.propTypes = {
  initialValues: PropTypes.object.isRequired,
  validationSchema: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
};

export default memo(DynamicForm);
