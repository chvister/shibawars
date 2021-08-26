import { red } from '@material-ui/core/colors';
import { createTheme } from '@material-ui/core/styles';

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: '#ffa509',
    },
    secondary: {
      main: '#ff8400',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#fff',
    },
  },
  overrides: {
    // Style sheet name ⚛️
    MuiButton: {
      // Name of the rule
      contained: {
        // Some CSS
        background: 'linear-gradient(45deg, #ff8400 30%, #ffa509 90%)',
        border: "1px solid black",
        borderRadius: 3,
        color: 'black',
        margin: 10,
        width: 192,
        height: 48,
        padding: '0 30px',
        boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
      },
    },
  },
});

export default theme;