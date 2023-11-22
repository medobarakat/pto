import React from "react";
import propTypes from "prop-types";
import classNames from "classnames";
import { FormControl, Select, InputLabel, MenuItem } from "@mui/material";
//*** styles ***
import { useTheme } from "react-jss";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { createUseStyles } from "react-jss";
import {
  CustomDropdownStyles,
  ThemeOverrides,
} from "assets/styles/components/FormFields/customDropdown.styles";
const useStyles = createUseStyles(CustomDropdownStyles);

function CustomDropdown({
  id,
  variant,
  label,
  items,
  value,
  maxWidth,
  onChange,
  dynamicItem,
  name
}) {
  const systemTheme = useTheme();
  const theme = createTheme(ThemeOverrides(systemTheme));
  const classes = useStyles();

  return (
    <FormControl className={classes.formControl} fullWidth>
      <ThemeProvider theme={theme}>
        {label && <InputLabel id={`${id}--label`}>{label}</InputLabel>}
        <Select
          id={id}
          variant={variant}
          label={label && label}
          value={value}
          name={name}
          onChange={onChange}
          className={classNames(classes.select, {
            [classes.standardSelect]: variant === "standard",
          })}
          MenuProps={{
            sx: { maxWidth: maxWidth },
          }}
        >
          {dynamicItem
            ? items.map((item,index) => (
                <MenuItem
                  key={item+index}
                  className={classes.selectMenuItem}
                  value={item}
                  title={item}
                >
                  <div
                    style={{
                      maxWidth: maxWidth,
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {item}
                  </div>
                </MenuItem>
              ))
            : items.map((item) => (
                <MenuItem
                  key={item.id}
                  id={item.id}
                  className={classes.selectMenuItem}
                  value={item.value}
                  title={item.text}
                >
                  <div
                    style={{
                      maxWidth: maxWidth,
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {item.text}
                  </div>
                </MenuItem>
              ))}
        </Select>
      </ThemeProvider>
    </FormControl>
  );
}

CustomDropdown.defaultProps = {
  variant: "standard",
  maxWidth: "-webkit-fill-available",
};

CustomDropdown.propTypes = {
  id: propTypes.oneOfType([propTypes.string, propTypes.number]),
  variant: propTypes.oneOf(["filled", "outlined", "standard"]),
  // items: propTypes.arrayOf(propTypes.object).isRequired,
  value: propTypes.string,
  onChange: propTypes.func,
};

export default React.memo(CustomDropdown);
