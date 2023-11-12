import makeData from 'data/makeData.homepage'
import { memo, useState, useRef, useMemo, useCallback } from 'react'
import axios from 'axios';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { Button, IconButton, Tooltip, Container, Stack } from '@mui/material'
import moment from 'moment';
import HtmlReactParser from 'html-react-parser';
// *** components ***
import Card from "components/Card"
import CardIcon from 'components/Card/CardIcon';
import CardBody from "components/Card/CardBody"
import CardFooter from 'components/Card/CardFooter';
import ReactTable from 'components/DataTable'
import DateColumnFilter from 'components/DataTable/utils/DateColumnFilter';
import InteractiveButton from 'components/FormFields/CustomButton/InteractiveButton';
import CreateNewJobModal from 'components/views/homepage/create-new-job.modal';
import CreateSingleProcessModal from 'components/views/homepage/create-single-process-modal'
import NoData from 'components/views/homepage/no-data'
// *** custom modals ***
import SuccessFailureModal from 'shared/modals/success-failure.modal';
import AcceptRejectDialog from 'shared/modals/accept-reject.dialog';
// *** hooks ***
import { DT_FILTER_LBL_NUMBER_OF_RECORDS } from 'hooks/useFilterText'
// *** Icons ***
import AssignmentIcon from '@mui/icons-material/Assignment';
import ExceptionsIcon from '@mui/icons-material/BugReport';
import DynamicFormIcon from '@mui/icons-material/DynamicForm';
import LogsIcon from '@mui/icons-material/Description';
import AddIcon from '@mui/icons-material/Add';
import MigrationIcon from '@mui/icons-material/MultipleStop';
import CheckIcon from '@mui/icons-material/Check';
import MemoryIcon from '@mui/icons-material/Memory';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import CloseIcon from '@mui/icons-material/Close';
import SummarizeIcon from '@mui/icons-material/Summarize';
// *** styles ***
import { createUseStyles } from 'react-jss'
import { DataTableActionStyles } from 'assets/styles/components/datatable.styles'
import styles from 'assets/styles/views/homepage.styles';

const useDTActionStyles = createUseStyles(DataTableActionStyles)
const useStyles = createUseStyles(styles)


const migrationStatusModalInitialState = {
  open: false,
  status: "",
  title: "",
  description: ""
}

const validationStatusModalInitialState = {
  open: false,
  status: "",
  title: "",
  description: ""
}

function Homepage() {
  const fetchIdRef = useRef(0)
  const dtActionClasses = useDTActionStyles()
  const classes = useStyles()


  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [pageCount, setPageCount] = useState(0)
  const [jobModalIsOpen, setJobModalIsOpen] = useState(false)
  const [singleProcessModalIsOpen, setSingleProcessModalIsOpen] = useState(false)
  // --------------- Migration ---------------
  const [migrationConfirmDialogIsOpen, setMigrationConfirmDialogIsOpen] = useState(false)
  const [migrationBtnSelectedID, setMigrationBtnSelectedID] = useState(null)
  const [migrationBtnIsLoading, setMigrationBtnIsLoading] = useState(false)
  const [migrationBtnIsSuccess, setMigrationBtnIsSuccess] = useState(null)
  const [migrationStatusModal, setMigrationStatusModal] = useState(migrationStatusModalInitialState)
  // --------------- Validation ---------------
  const [validationConfirmDialogIsOpen, setValidationConfirmDialogIsOpen] = useState(false)
  const [validationBtnSelectedID, setValidationBtnSelectedID] = useState(null)
  const [validationBtnIsLoading, setValidationBtnIsLoading] = useState(false)
  const [validationBtnIsSuccess, setValidationBtnIsSuccess] = useState(null)
  const [validationStatusModal, setValidationStatusModal] = useState(validationStatusModalInitialState)
  const navigate = useNavigate();





  // *************** CALLBACKS ******************
  const handleClickOpenJobModal = () => {
    setJobModalIsOpen(true)
  }

  const onCloseJobModal = (userCreateOneJobSuccessfully) => {
    setJobModalIsOpen(false)

    if (userCreateOneJobSuccessfully) {
      fetchData({
        pageSize: 10,
        pageIndex: 1,
        filters: []
      })
    }
  }

  const handleClickOpenSingleProcessModal = () => {
    setSingleProcessModalIsOpen(true)
  }

  const handleReportClick = ()=>{
    navigate('/reports');

  }

  const onCloseSingleProcessModal = (userCreateOneSingleProcessSuccessfully) => {
    if (userCreateOneSingleProcessSuccessfully) {
      setSingleProcessModalIsOpen(false)
      fetchData({
        pageSize: 10,
        pageIndex: 1,
        filters: []
      })
    } else setSingleProcessModalIsOpen(false)
  }

  const fetchData = useCallback(({ pageSize, pageIndex, filters }) => {

    // console.log("pageSize: ", pageSize)
    // console.log("pageIndex: ", pageIndex)
    // console.log("filters: ", filters)
    // console.log("---------------------")


    setLoading(true)
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      //?=================[ DEV ]========================
      const serverData = makeData(50)
      const fetchId = ++fetchIdRef.current
      setTimeout(() => {
        if (fetchId === fetchIdRef.current) {
          const startRow = pageSize * pageIndex
          const endRow = startRow + pageSize
          setData(serverData.slice(startRow, endRow))
          setPageCount(Math.ceil(serverData.length / pageSize))
          setLoading(false)
        }
      }, 2000)
    }
    else {
      //?=================[ PROD ]========================
      // const body = {
      //     pageIndex: pageIndex,
      //     pageSize: pageSize,
      //     sortBy: [],
      //     filters: filters,
      //     columnOrder: [],
      //     hiddenColumns: []
      // }      
      const headers = { "Content-type": "application/json" }
      axios
        .get("/api/getAllJobs", { headers })
        .then(response => {
          setLoading(false)
          setData(response.data)
          // setPageCount(response.data.pagination.pageCount)
        })
        .catch(error => {
          console.log("error: ", error);
          setLoading(false)
        })
    }
  }, [])


  // --------------- Validation ---------------
  const handleClickValidation = useCallback((id) => {
    setValidationBtnSelectedID(id)
    setValidationConfirmDialogIsOpen(true)
  }, [])

  const onAcceptValidation = useCallback((id) => {
    setValidationBtnIsLoading(true)
    setValidationConfirmDialogIsOpen(false)

    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      //?=================[ DEV ]========================
      // setTimeout(() => {
      //   setValidationBtnIsLoading(false)
      //   setValidationBtnIsSuccess(false)
      //   setValidationStatusModal({
      //     open: true,
      //     status: "failure",
      //     title: "Validation Has Errors",
      //     description: HtmlReactParser(`Some processes for jobID ${id} has errors <br /> please check the log table.`)
      //   })
      // }, 3000)

      setTimeout(() => {
        setValidationBtnIsLoading(false)
        setValidationBtnIsSuccess(true)
        setValidationStatusModal({
          open: true,
          status: "success",
          title: "Validation Successfully",
          description: HtmlReactParser(`validation processes for jobID ${id} done without errors.`)
        })
      }, 3000)
    }
    else {
      //?=================[ PROD ]======================== 
      const headers = { "Content-type": "application/json" }
      axios
        .get(`/api/validate/${id}`, { headers })
        .then(response => {
          setValidationBtnIsLoading(false)
          setValidationBtnIsSuccess(false)
          setValidationStatusModal({
            open: true,
            status: "success",
            title: "Validation Successfully",
            description: HtmlReactParser(response?.data?.message ? response?.data?.message : "")
          })
        })
        .catch(error => {
          setValidationBtnIsLoading(false)
          setValidationBtnIsSuccess(false)
          setValidationStatusModal({
            open: true,
            status: "failure",
            title: "Validation Has Errors",
            description: HtmlReactParser(error?.response?.data?.message ? error?.response?.data?.message : "")
          })
        })
    }
  }, [])

  const onRejectValidation = useCallback(() => {
    setValidationConfirmDialogIsOpen(false)
    setTimeout(() => { setValidationBtnSelectedID(null) }, 500)
  }, [])

  const onCloseValidationSuccessFailureModal = useCallback(() => {
    setValidationStatusModal(validationStatusModalInitialState)
    setValidationBtnIsSuccess(null)
    setTimeout(() => { setValidationBtnSelectedID(null) }, 500)
    fetchData({ pageSize: 10, pageIndex: 1, filters: [] })
  }, [])


  // --------------- Migration ---------------
  const handleClickMigration = useCallback((id) => {
    setMigrationBtnSelectedID(id)
    setMigrationConfirmDialogIsOpen(true)
  }, [])

  const onAcceptMigration = useCallback((id) => {
    setMigrationBtnIsLoading(true)
    setMigrationConfirmDialogIsOpen(false)

    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      //?=================[ DEV ]========================
      setTimeout(() => {
        setMigrationBtnIsLoading(false)
        setMigrationBtnIsSuccess(true)
        setMigrationStatusModal({
          open: true,
          status: "success",
          title: "Migration Started",
          description: `Migration Started for JobID: ${id}`
        })
      }, 3000)

      // setTimeout(() => {
      //   setMigrationBtnIsLoading(false)
      //   setMigrationBtnIsSuccess(false)
      //   setMigrationStatusModal({
      //     open: true,
      //     status: "fail",
      //     title: "Migration Fail",
      //     description: `Migration Fail for JobID: ${id}`
      //   })
      // }, 3000)
    }
    else {
      //?=================[ PROD ]========================
      const headers = { "Content-type": "application/json" }
      axios
        .get(`/api/startMigration/${id}`, { headers })
        .then(response => {
          setMigrationBtnIsLoading(false)
          setMigrationBtnIsSuccess(true)
          setMigrationStatusModal({
            open: true,
            status: "success",
            title: "Migration Complete",
            description: `Migration Complete for JobID: ${id}`
          })
        })
        .catch(error => {
          console.log("error: ", error);
          setMigrationBtnIsLoading(false)
          setMigrationBtnIsSuccess(false)
          setMigrationStatusModal({
            open: true,
            status: "fail",
            title: "Migration Fail",
            description: `Migration Fail for JobID: ${id}`
          })
        })
    }
  }, [])

  const onRejectMigration = useCallback(() => {
    setMigrationBtnSelectedID(null)
    setMigrationConfirmDialogIsOpen(false)
  }, [])

  const onCloseMigrationSuccessFailureModal = useCallback(() => {
    setMigrationStatusModal(migrationStatusModalInitialState)
    setMigrationBtnIsSuccess(null)
    setMigrationBtnSelectedID(null)
    fetchData({ pageSize: 10, pageIndex: 1, filters: [] })
  }, [])


  // *************** MEMOS ******************
  const columns = useMemo(() => {
    return (
      [
        {
          Header: 'Job ID',
          id: "id",
          sortable: true,
          accessor: 'id',
          filterTextVariant: DT_FILTER_LBL_NUMBER_OF_RECORDS,
          filter: 'fuzzyText',
        },
        {
          Header: 'Type',
          id: "singleProcess",
          sortable: true,
          accessor: ({ singleProcess }) => Boolean(singleProcess) ? "Single" : "Multi",
          filterTextVariant: DT_FILTER_LBL_NUMBER_OF_RECORDS,
          filter: 'fuzzyText',
        },
        {
          Header: 'From Date',
          id: 'fromDate',
          sortable: true,
          disableTooltip: ({ processName }) => Boolean(processName),
          accessor: ({ fromDate, processName }) => Boolean(processName) ? <NoData /> : moment(fromDate).format("MM/DD/YYYY"),
          Filter: DateColumnFilter,
        },
        {
          Header: 'To Date',
          id: 'toDate',
          sortable: true,
          disableTooltip: ({ processName }) => Boolean(processName),
          accessor: ({ toDate, processName }) => Boolean(processName) ? <NoData /> : moment(toDate).format("MM/DD/YYYY"),
          Filter: DateColumnFilter,
        },
        {
          Header: 'Process UUID',
          id: "processName",
          sortable: true,
          disableTooltip: ({ processName }) => !Boolean(processName),
          accessor: ({ processName }) => !Boolean(processName) ? <NoData /> : processName,
          filterTextVariant: DT_FILTER_LBL_NUMBER_OF_RECORDS,
          filter: 'fuzzyText',
          extraStyles: { maxWidth: 200 },
          extraCellWrapperStyles: {
            maxWidth: 200,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: "25px"
          },
        },
        {
          Header: 'Created Date',
          id: 'createdDate',
          sortable: true,
          accessor: ({ createdDate }) => moment(createdDate).format("MM/DD/YYYY"),
          Filter: DateColumnFilter,
        },
        {
          Header: 'Modify Date',
          id: 'modifyDate',
          sortable: true,
          accessor: ({ modifyDate }) => moment(modifyDate).format("MM/DD/YYYY"),
          Filter: DateColumnFilter,
        },
        {
          Header: 'Status',
          id: "status",
          sortable: true,
          accessor: 'status',
          filterTextVariant: DT_FILTER_LBL_NUMBER_OF_RECORDS,
          filter: 'fuzzyText',
        },
        {
          Header: '',
          id: 'actions',
          sortable: false,
          isRowActions: true,
          extraStyles: { zIndex: 1051 },
          extraHeaderStyles: { width: "100%", textAlign: "center", pointerEvents: "none" },
          Filter: () => <div className={dtActionClasses.hiddenFilter}></div>,
          accessor: ({ status, processName, id, validProcess }) => {

            const isSingleProcess = Boolean(processName)

            return (
              <Stack direction="row" spacing={1}>
                <div>
                  <Tooltip
                    placement="left"
                    title={HtmlReactParser(`
                      <div style="text-align: center; padding: 10px 5px">
                        <span style="margin-bottom: 10px; display: inline-block">
                          View Analysis
                        </span>
                        <br /> 
                        <span>
                          For JobID: <span style="background: #3D4B7F; padding: 2px 5px; border-radius: 50px">${id}</span>
                        </span>
                      </div>
                    `)}
                  >
                    <IconButton
                      className={classes.analysisBtn}
                      onClick={() => navigate(`/analysis?jobID=${id}`, {
                        state: {
                          singleProcess: isSingleProcess
                        }
                      })}
                    >
                      <DynamicFormIcon />
                    </IconButton>
                  </Tooltip>
                </div>

                <div>
                  {!isSingleProcess ? (
                    <Tooltip
                      placement="left"
                      title={HtmlReactParser(`
                        <div style="text-align: center; padding: 10px 5px">
                          <span style="margin-bottom: 10px; display: inline-block">
                            View Exceptions
                          </span>
                          <br /> 
                          <span>
                            For JobID: <span style="background: #e91e63; padding: 2px 5px; border-radius: 50px">${id}</span>
                          </span>
                        </div>
                      `)}
                    >
                      <IconButton
                        className={classes.exceptionsBtn}
                        onClick={() => navigate(`/exceptions?jobID=${id}`)}
                      >
                        <ExceptionsIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <IconButton
                      className={classes.exceptionsBtn}
                      disabled={true}
                      classes={{ disabled: classes.disabledExceptionsBtn }}
                    >
                      <ExceptionsIcon />
                    </IconButton>
                  )}
                </div>

                <InteractiveButton
                  className={classNames(classes.validationBtn, {
                    "success": Boolean(validationBtnSelectedID === id && validationBtnIsSuccess),
                    "loading": Boolean(validationBtnSelectedID === id && validationBtnIsLoading)
                  })}
                  variant="round"
                  toolTipTitle={HtmlReactParser(`
                      <div style="text-align: center; padding: 10px 5px">
                        <span style="margin-bottom: 10px; display: inline-block">
                          Validate Process
                        </span>
                        <br /> 
                        <span>
                          For JobID: <span style="background: #006064; padding: 2px 5px; border-radius: 50px">${id}</span>
                        </span>
                      </div>
                  `)}
                  toolTipPlacement="left"
                  initialIcon={<TaskAltIcon />}
                  successIcon={<CheckIcon />}
                  failureIcon={<CloseIcon />}
                  loading={Boolean(validationBtnSelectedID === id && validationBtnIsLoading)}
                  success={Boolean(validationBtnSelectedID === id && validationBtnIsSuccess)}
                  failure={Boolean(validationBtnIsSuccess !== null && validationBtnSelectedID === id && !validationBtnIsSuccess)}
                  buttonSuccessClass=""
                  circularProps={{ size: 47, classes: { root: "interactive-spinner" } }}
                  data-id={id}
                  onClick={() => handleClickValidation(id)}
                  disabled={validationBtnIsLoading}
                  disableTooltip={validationBtnIsLoading}
                  containedClasses=""
                />

                <InteractiveButton
                  className={classNames(classes.migrationBtn, {
                    "success": Boolean(migrationBtnSelectedID === id && migrationBtnIsSuccess),
                    "loading": Boolean(migrationBtnSelectedID === id && migrationBtnIsLoading)
                  })}
                  variant="round"
                  text="Start Migration"
                  toolTipTitle={HtmlReactParser(`
                      <div style="text-align: center; padding: 10px 5px">
                        <span style="margin-bottom: 10px; display: inline-block">
                          Start Migration
                        </span>
                        <br /> 
                        <span>
                          For JobID: <span style="background: #3D4B7F; padding: 2px 5px; border-radius: 50px">${id}</span>
                        </span>
                      </div>
                  `)}
                  toolTipPlacement="left"
                  initialIcon={<MigrationIcon />}
                  successIcon={<CheckIcon />}
                  failureIcon={<CloseIcon />}
                  loading={Boolean(migrationBtnSelectedID === id && migrationBtnIsLoading)}
                  success={Boolean(migrationBtnSelectedID === id && migrationBtnIsSuccess)}
                  failure={Boolean(migrationBtnIsSuccess !== null && migrationBtnSelectedID === id && !migrationBtnIsSuccess)}
                  buttonSuccessClass=""
                  circularProps={{ size: 47, classes: { root: "interactive-spinner" } }}
                  onClick={() => handleClickMigration(id)}
                  disabled={migrationBtnIsLoading || !validProcess}
                  disableTooltip={migrationBtnIsLoading || !validProcess}
                  // disabled={Boolean(migrationBtnSelectedID === id && migrationBtnIsLoading)}
                  containedClasses=""
                />

                <div>
                  {status === "migrationFinished" || validProcess === true ? (
                    <Tooltip
                      placement="left"
                      title={HtmlReactParser(`
                        <div style="text-align: center; padding: 10px 5px">
                          <span style="margin-bottom: 10px; display: inline-block">
                            View Logs
                          </span>
                          <br /> 
                          <span>
                            For JobID: <span style="background: #ff9800; padding: 2px 5px; border-radius: 50px">${id}</span>
                          </span>
                        </div>
                      `)}
                    >
                      <IconButton
                        className={classes.logsBtn}
                        onClick={() => navigate(`/logs?jobID=${id}`)}
                      >
                        <LogsIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <IconButton
                      className={classes.logsBtn}
                      onClick={() => navigate(`/logs?jobID=${id}`)}
                      disabled
                      classes={{ disabled: classes.disabledLogsBtn }}
                    >
                      <LogsIcon />
                    </IconButton>
                  )}
                </div>
              </Stack>
            )
          }
        }
      ]
    )
  }, [migrationBtnSelectedID, migrationConfirmDialogIsOpen, migrationBtnIsLoading, migrationBtnIsSuccess, validationBtnSelectedID, validationConfirmDialogIsOpen, validationBtnIsLoading, validationBtnIsSuccess])


  return (
    <div className={classes.homepageRoot}>
      <Container maxWidth="xl">
        {/* --------------- Validation --------------- */}
        <AcceptRejectDialog
          title="Confirm Validation"
          description={`Would you like to validate process for JobID: ${validationBtnSelectedID}?`}
          confirmButtonTitle="Yes"
          cancelButtonTitle="No"
          open={validationConfirmDialogIsOpen}
          onClose={() => setValidationConfirmDialogIsOpen(false)}
          onAccept={() => onAcceptValidation(validationBtnSelectedID)}
          onReject={onRejectValidation}
          fullWidth
        />

        <SuccessFailureModal
          {...validationStatusModal}
          onCloseModal={onCloseValidationSuccessFailureModal}
        />


        {/* --------------- Migration --------------- */}
        <AcceptRejectDialog
          title="Confirm Migration"
          description={`Would you like to start migration for JobID: ${migrationBtnSelectedID}?`}
          confirmButtonTitle="Yes"
          cancelButtonTitle="No"
          open={migrationConfirmDialogIsOpen}
          onClose={() => setMigrationConfirmDialogIsOpen(false)}
          onAccept={() => onAcceptMigration(migrationBtnSelectedID)}
          onReject={onRejectMigration}
          fullWidth
        />

        <SuccessFailureModal
          {...migrationStatusModal}
          onCloseModal={onCloseMigrationSuccessFailureModal}
        />

        <CreateNewJobModal
          open={jobModalIsOpen}
          onClose={onCloseJobModal}
        />

        <CreateSingleProcessModal
          open={singleProcessModalIsOpen}
          onClose={onCloseSingleProcessModal}
        />


        <Stack direction="row" alignItems="center">
          <Button
            variant="contained"
            className="top-actions-btn create-new-job-button"
            onClick={handleClickOpenJobModal}
          >
            <span>
              <AddIcon />
              Create New Job
            </span>
          </Button>

          <Button
            variant="outlined"
            className="top-actions-btn single-process-button"
            onClick={handleClickOpenSingleProcessModal}
          >
            <span>
              <MemoryIcon />
              Migrate Single Process
            </span>
          </Button>

          <Button
            variant="outlined"
            className="top-actions-btn single-process-button"
            onClick={handleReportClick}
          >
            <span>
              <SummarizeIcon />
              Reports
            </span>
          </Button>


        </Stack>

        <Card style={{ marginTop: 100 }}>
          <div className="card-icon-wrapper">
            <CardIcon color="primary">
              <AssignmentIcon sx={{ color: "#fff" }} />
            </CardIcon>
          </div>
          <CardBody>
            <ReactTable
              columns={columns}
              data={data}
              fetchData={fetchData}
              loading={loading}
              pageCount={pageCount}
              PageSizeList={[10, 20, 25, 50, 75, 100]}
            // extraFooterContent={extraFooterContent}
            />
          </CardBody>
          <CardFooter />
        </Card>

      </Container>
    </div>
  )
}

export default memo(Homepage)
