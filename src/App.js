import React, { useState, useEffect } from 'react';
import { DataGrid } from '@material-ui/data-grid';
import Grid from '@material-ui/core/Grid';
import { makeStyles } from '@material-ui/core/styles';
import axios from 'axios';
import moment from 'moment';

const chartTypes = [
  'VZSA50',
  'VZSA60',
  'VZSF50',
  'VZSF60',
  'VZSF51',
  'VZSF61',
];

const apiUrl = process.env.REACT_APP_API_URL || 'http:localhost:8080';
const xml2geojsonUrl = process.env.REACT_APP_XML2GEOJSON_API_URL || 'http:localhost:8080';

const columns = [
  { field: 'index', headerName: 'No.', valueFormatter: ({ value }) => (value + 1), width: 80, sortable: false, },
  { field: 'datetime', headerName: 'datetime', valueFormatter: ({ value }) => moment(value).format(), width: 220, sortable: true, },
  { field: 'title', headerName: 'title', type: 'string', width: 250, sortable: true, },
  { field: 'type', headerName: 'type', type: 'string', width: 100, sortable: true, },
  {
    field: "xml", headerName: "xml", width: 300,
    valueGetter: (params) => [`${params.getValue('url')}`, `${params.getValue('filename')}`],
    renderCell: ({ value }) => (<a href={value[0]}>{value[1]}</a>),
  },
  {
    field: "optional", headerName: "optional", width: 80,
    valueGetter: (params) => chartTypes.includes(params.getValue('type')) ? `${xml2geojsonUrl}/?url=${params.getValue('url')}` : '',
    renderCell: ({ value }) => (value ? <a href={value}>geojson</a> : ''),
  },
];

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100vw',
    height: '100vh'
  },
  headerGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '20',
  },
  dataGrid: {
    position: 'absolute',
    top: 50,
    left: 0,
    width: '100%',
    height: 'calc(100% - 60px)',
  },
  title: {
    padding: '0.2em 0.5em',
    margin: 0,
  }
}));

function App() {
  const classes = useStyles();
  const [items, setItems] = useState([]);
  const [pageParams, setPageParams] = useState({ pageSize: Number(process.env.REACT_APP_COUNT || 100), page: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setItems(await query(pageParams.pageSize, pageParams.pageSize * pageParams.page));
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setItems(await query(pageParams.pageSize, pageParams.pageSize * pageParams.page));
      setLoading(false);
    })();
  }, [pageParams]);

  const query = async (limit, offset) => {
    return axios.get(`${apiUrl}/?limit=${limit}&offset=${offset}`)
      .then((response) => {
        return response.data;
      })
      .then(entities => {
        return entities.map((x, i) => ({ index: i + offset, ...x }));       // リスト表示するためユニークな番号を付けて返す。
      })
      .catch((response) => {
        console.error(response);
        alert(response);
      });
  };

  return (
    <Grid container spacing={0} className={classes.root}>
      <Grid item xs={12} className={classes.headerGrid} >
        <h1 className={classes.title}>JMA XML</h1>
      </Grid>
      <Grid item xs={12} className={classes.dataGrid}>
        <DataGrid
          rows={items}
          columns={columns}
          disableColumnMenu={true}
          headerHeight={30}
          rowHeight={30}
          pagination
          pageSize={pageParams.pageSize}
          rowCount={100000}
          paginationMode="server"
          onPageSizeChange={(param) => { setPageParams(param); }}
          onPageChange={(param) => { setPageParams(param); }}
          loading={loading}
          rowsPerPageOptions={[50, 100, 500, 1000]}
          hideFooterSelectedRowCount={true}
        />
      </Grid>
    </Grid>
  );
}

export default App;
