import { memo, useState, useLayoutEffect, useMemo, useCallback } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Container, Tabs, Tab } from '@mui/material'
import queryString from 'query-string';
// *** shared ***
import a11yProps from 'shared/modals/a11yProps'
// *** views ***
import ErrorPage from 'views/errorPage';
// *** components ***
import ValidationTab from 'components/views/logs/tabValidation'
import MigrationTab from 'components/views/logs/tabMigration'
// *** Icons ***
import MultipleStopIcon from '@mui/icons-material/MultipleStop';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
// *** styles ***
import classNames from 'classnames'
import { createUseStyles } from 'react-jss'
import styles from 'assets/styles/views/logs.styles';
const useStyles = createUseStyles(styles)




function Logs() {
  const classes = useStyles()
  const location = useLocation();
  const parsed = queryString.parse(location.search);
  const [searchParams, setSearchParams] = useSearchParams();


  const [activeTab, setActiveTab] = useState(0)
  // ***************** MEMOS ***************** 
  const validationIcon = useMemo(() => { return <TaskAltIcon /> }, [])
  const migrationIcon = useMemo(() => { return <MultipleStopIcon /> }, [])
  const errorPageExtraJSX = useMemo(() => { return <Link to="/">Back to Homepage</Link> }, [])
  const tabsClasses = useMemo(() => {
    return {
      root: classNames(classes.tabsRoot, {
        "validationTab": activeTab === 0,
        "migrationTab": activeTab === 1,
      }),
      indicator: classes.tabsIndicator
    }
  }, [activeTab, classes.tabsIndicator, classes.tabsRoot])

  // ***************** CALLBACKS ***************** 
  const handleChange = useCallback((event, newValue) => {
    setActiveTab(newValue)

    switch (newValue) {
      case 0:
        searchParams.set("activeTab", "validation");
        setSearchParams(searchParams)
        break;
      case 1:
        searchParams.set("activeTab", "migration");
        setSearchParams(searchParams)
        break;
      default:
        break;
    }
  }, [searchParams, setSearchParams])


  useLayoutEffect(() => {    
    if (parsed?.jobID) {
      switch (parsed?.activeTab) {
        case "validation":
          setActiveTab(0)
          break;
        case "migration":
          setActiveTab(1)
          break;
        default:
          setActiveTab(0)
          break;
      }
    }
  }, [parsed?.jobID])  

  if (!Boolean(parsed?.jobID)) return (
    <ErrorPage
      errorMessage="Oops!&nbsp;&nbsp;<strong>[ Job ID ]</strong>&nbsp;&nbsp;is not present."
      extraJSX={errorPageExtraJSX}
    />
  )
  return (
    <div className={classes.logsRoot}>
      <Container maxWidth="xl">
        <div className="tabsBox">
          <Tabs
            value={activeTab}
            classes={tabsClasses}
            onChange={handleChange}
          >
            <Tab
              label="Validation Logs"
              iconPosition="start"
              icon={validationIcon}
              disableRipple
              {...a11yProps(0)}
            />
            <Tab
              label="Migration Logs"
              iconPosition="start"
              icon={migrationIcon}
              disableRipple
              {...a11yProps(1)}
            />
          </Tabs>
        </div>

        <div className="tabsContent">
          {activeTab === 0 && <ValidationTab />}
          {activeTab === 1 && <MigrationTab />}
        </div>
      </Container>
    </div>
  )
}

export default memo(Logs)
