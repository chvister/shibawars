import React from 'react';
import Image from 'next/dist/client/image';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

export default function AlertDialog({ title, text, imageUri, onClose }) {
    const [open, setOpen] = React.useState(true);

    const handleClose = () => {
        setOpen(false);
        if (onClose !== undefined) {
            onClose();
        }
    };

    return (
        <div>
            <Dialog
                open={open}
                onClose={() => handleClose()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    {imageUri === undefined ? null : <Image width={512} height={512} src={imageUri} />}
                    <DialogContentText id="alert-dialog-description">
                        {text}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleClose()} variant="contained" autoFocus>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
