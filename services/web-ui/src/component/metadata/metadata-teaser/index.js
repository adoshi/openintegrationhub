import React from 'react';
import flow from 'lodash/flow';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import axios from 'axios';

// Ui
import { withStyles } from '@material-ui/styles';
import Grid from '@material-ui/core/Grid';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Button from '@material-ui/core/Button';
import InputLabel from '@material-ui/core/InputLabel';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Modal from '@material-ui/core/Modal';
import {
    Delete, Edit, Add,
} from '@material-ui/icons';


// Domain
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';

import { getConfig } from '../../../conf';

// Actions
import {
    updateDomain, deleteDomain,
} from '../../../action/metadata';

const conf = getConfig();

const useStyles = {
    heading: {
        fontSize: '0.9375rem',
        fontWeight: '400',
    },
    modal: {
        backgroundColor: 'white',
        margin: 'auto',
        outline: 'none',
    },
};

class MetaDataTeaser extends React.PureComponent {
    state= {
        editDomain: false,
        addSchema: false,
        wasChanged: false,
        editorData: null,
        schemas: [],
    }

    constructor(props) {
        super(props);
        this.dummyData = {
            name: 'string',
            description: 'string',
            value: {
                $id: 'address',
                required: [
                    'street_address',
                    'city',
                    'state',
                ],
                properties: {
                    street_address: {
                        type: 'string',
                    },
                    city: {
                        type: 'string',
                    },
                    state: {
                        type: 'string',
                    },
                },
            },
            owners: [
                {
                    id: 'string',
                    type: 'USER',
                },
            ],
        };
    }


    getSchemas() {
        return this.state.schemas.map(schema => <Grid item xs={12} key={schema.id}>
            <Grid container spacing={2}>
                <Grid item xs={2}><InputLabel>Name:</InputLabel><Typography>{schema.name}</Typography></Grid>
                <Grid item xs={10}><InputLabel>Uri:</InputLabel><Typography>{schema.uri}</Typography></Grid>
            </Grid>
        </Grid>);
    }

    saveSchema(e) {
        e.stopPropagation();
        // if (this.state.wasChanged) {
        //     this.setState({
        //         addSchema: false,
        //         wasChanged: false,
        //         editorData: null,
        //     });
        // }
    }

    editOpen= (e) => {
        e.stopPropagation();
        this.setState({
            editDomain: true,
        });
    }

    deleteDomain = (e) => {
        e.stopPropagation();
        this.props.deleteDomain(this.props.data.id);
    }

    updateDomain = (e) => {
        e.stopPropagation();
        if (this.state.wasChanged) {
            this.props.updateDomain(this.state.editorData);
            this.setState({
                editDomain: false,
                wasChanged: false,
                editorData: null,
            });
        }
    }

    editorChange(e) {
        if (!e.error) {
            this.setState({
                editorData: e.jsObject,
                wasChanged: true,
            });
        }
    }

    async handleExpansion(domainId, e, expanded) {
        let result = null;
        if (expanded) {
            result = await axios({
                method: 'get',
                url: `${conf.endpoints.metadata}/domains/${domainId}/schemas`,
                withCredentials: true,
                json: true,
            });
            this.setState({
                schemas: result.data.data,
            });
        }
    }

    render() {
        const {
            classes,
        } = this.props;
        return (
            <Grid item xs={12}>
                <ExpansionPanel onChange={this.handleExpansion.bind(this, this.props.data.id)}>
                    <ExpansionPanelSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1a-content"
                        id="panel1a-header"
                    >

                        <Grid container>
                            <Grid item xs={3}><InputLabel>Name:</InputLabel><Typography >{this.props.data.name}</Typography></Grid>
                            <Grid item xs={3}><InputLabel>Description:</InputLabel><Typography >{this.props.data.description}</Typography></Grid>

                            <Grid item xs={4} />
                            <Grid item xs={2} >
                                <Button variant="outlined" aria-label="next" onClick={this.editOpen}>
                                    <Edit/>
                                </Button>
                                <Button variant="outlined" aria-label="next" onClick={this.deleteDomain}>
                                    <Delete/>
                                </Button>
                            </Grid>
                        </Grid>

                    </ExpansionPanelSummary>
                    <ExpansionPanelDetails>
                        <Grid container>
                            <Grid item xs={2}><h3>Schemas</h3></Grid>
                            <Grid item xs={10}>
                                <Button variant="outlined" aria-label="next" onClick={() => { this.setState({ addSchema: true }); }}>
                                    <Add/>
                                </Button>
                            </Grid>
                            {
                                this.state.schemas.length && this.getSchemas()
                            }
                            <Modal
                                aria-labelledby="simple-modal-title"
                                aria-describedby="simple-modal-description"
                                open={this.state.addSchema}
                                onClose={ () => { this.setState({ addSchema: false }); }}
                                style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                            >
                                <div className={classes.modal}>
                                    <JSONInput
                                        id = 'jsonEdit'
                                        locale = {locale}
                                        theme = 'dark_vscode_tribute'
                                        placeholder = {this.dummyData}
                                        height = '550px'
                                        width = '600px'
                                        onChange={this.editorChange.bind(this)}
                                    />
                                    <Button variant="outlined" aria-label="Add" onClick={() => { this.setState({ addSchema: false }); }}>
                            close
                                    </Button>
                                    <Button variant="outlined" aria-label="Add" onClick={this.addSchema} disabled={!this.state.wasChanged}>
                            Save
                                    </Button>
                                </div>

                            </Modal>
                        </Grid>
                    </ExpansionPanelDetails>
                </ExpansionPanel>
                <Modal
                    aria-labelledby="simple-modal-title"
                    aria-describedby="simple-modal-description"
                    open={this.state.editDomain}
                    onClose={ () => { this.setState({ editDomain: false }); }}
                    style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                >
                    <div className={classes.modal}>
                        <JSONInput
                            id = 'jsonEdit'
                            locale = {locale}
                            theme = 'dark_vscode_tribute'
                            placeholder = {this.props.data}
                            height = '550px'
                            width = '600px'
                            onChange={this.editorChange.bind(this)}
                        />
                        <Button variant="outlined" aria-label="Add" onClick={() => { this.setState({ editDomain: false }); }}>
                            close
                        </Button>
                        <Button variant="outlined" aria-label="Add" onClick={this.updateDomain} disabled={!this.state.wasChanged}>
                            Save
                        </Button>
                    </div>

                </Modal>
            </Grid>
        );
    }
}

const mapStateToProps = state => ({
    metadata: state.metadata,
});
const mapDispatchToProps = dispatch => bindActionCreators({
    deleteDomain,
    updateDomain,
}, dispatch);

export default flow(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    ),
    withStyles(useStyles),
)(MetaDataTeaser);
