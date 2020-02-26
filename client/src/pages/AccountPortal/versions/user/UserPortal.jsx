import React, { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Link } from "react-router-dom"
import API from "../../../../utils/API"
import SimpleListView from "../../../../components/SimpleListView"
import { Snackbar, Grid, Typography, CardActionArea, CardContent, CardMedia, Card } from "@material-ui/core";
import { Alert } from '@material-ui/lab';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faSchool, faPencilRuler, faChalkboardTeacher } from "@fortawesome/free-solid-svg-icons"
import "../../../../utils/flowHeaders.min.css";
import "./main.css";
import clsx from "clsx"
import AccessDenied from "../../../../components/AccessDenied";
import PageSpinner from "../../../../components/PageSpinner";
import AnnouncementViewer from "../../../../components/AnnouncementViewer";
import SocketContext from "../../../../socket-context"


const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        backgroundColor: theme.palette.background.paper,
    },
    inline: {
        display: 'inline',
    },
    card: {
        maxWidth: 345,
    },
    cardMedia: {
        height: 140,
    },
    textGlow: {
        color: "white",
        textShadow: "2px 2px 7px #787676"
    },
    boxShadow: {
        boxShadow: "10px 10px 5px #bebebe"
    }
}));

function UserPortal(props) {
    const socket = React.useContext(SocketContext)

    const classes = useStyles();
    const MAX_ANN = 3;

    // HOOKS 
    // Stores this grade's information
    const [subjects, setSubjects] = useState({});

    // Stores current grade announcements
    const [gradeAnnouncements, setGradeAnnouncements] = useState([])
    // Stores current school announcements
    const [schoolAnnouncements, setSchoolAnnouncements] = useState([])

    // If loading, show loading screen
    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    // Route user to clicked subject page
    const handleOpenSubject = (subject_id) => {
        props.history.push(`/subject/${subject_id}`);
    }

    const handleRefresh = () => {
        setRefreshing(true);

        const promises = [];

        // Get 'Grade' associated with user account, populating subjects and their announcements
        promises.push(API.getUserGrade(props.user.profile._id, props.user.key))

        // Get school announcements
        promises.push(API.getSchoolAnnouncements(props.user.key))

        Promise.all(promises)
            .then((promiseResults) => {
                // Get & set grade's subjects info
                setSubjects(promiseResults[0].data ? promiseResults[0].data.subjects : []);

                // Get & Set school announcements
                setSchoolAnnouncements(promiseResults[1].data);


                let subjectAnnList = []
                if (promiseResults[0].data) {
                    for (const subjectDoc of promiseResults[0].data.subjects) {
                        subjectAnnList = subjectAnnList.concat(subjectDoc.announcements)
                    }
                }

                // Get & Set Subject announcements
                setGradeAnnouncements(subjectAnnList);

                // Set loading false, so the loading screen goes away
                setRefreshing(false);

            })
    }


    useEffect(() => {
        const promises = [];

        // Get 'Grade' associated with user account, populating subjects and their announcements
        promises.push(API.getUserGrade(props.user.profile._id, props.user.key))

        // Get school announcements
        promises.push(API.getSchoolAnnouncements(props.user.key))

        Promise.all(promises)
            .then((promiseResults) => {
                // Get & set grade's subjects info
                setSubjects(promiseResults[0].data ? promiseResults[0].data.subjects : []);

                // Get & Set school announcements
                setSchoolAnnouncements(promiseResults[1].data);


                let subjectAnnList = []
                if (promiseResults[0].data) {
                    for (const subjectDoc of promiseResults[0].data.subjects) {
                        subjectAnnList = subjectAnnList.concat(subjectDoc.announcements)
                    }
                }

                // Get & Set Subject announcements
                setGradeAnnouncements(subjectAnnList);

                // Set loading false, so the loading screen goes away
                setLoading(false);

            })

        const collections = ['announcements']
        for (const collection of collections) {
            socket.on(`refresh-${collection}`, function () {
                handleRefresh();
            })
        }

    }, [])

    if (loading) {
        return <PageSpinner />
    }

    return (
        <div style={{ display: "flex", width: "100%", marginTop: "5rem" }}>

            {/* ALERTS FOR API ACTIONS */}
            <Snackbar
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                open={refreshing}
            >
                <Alert severity={'info'}>
                    Refreshing...
                </Alert>
            </Snackbar>

            <Grid spacing={5} container style={{ padding: "2rem", width: "100%" }}>
                <Grid item xs={12}><Typography style={{ padding: "2rem" }} align='center' className={clsx(classes.textGlow, "flow-text")} variant="h3">welcome back, {props.user.profile.first_name} 😄</Typography> </Grid>
                {/* Announcements */}
                <Grid item xs={12} md={5} lg={4} xl={3}>
                    <div className={classes.boxShadow} >

                        <SimpleListView
                            title={"School Announcements"}
                            items={schoolAnnouncements}
                            pageMax={MAX_ANN}
                            icon={faSchool}
                            labelField={"title"}
                            viewer={AnnouncementViewer}
                        />
                        <SimpleListView
                            title={"Grade Announcements"}
                            items={gradeAnnouncements}
                            pageMax={MAX_ANN}
                            icon={faPencilRuler}
                            labelField={"title"}
                            viewer={AnnouncementViewer}
                        />

                    </div>
                </Grid>
                {/* Subjects */}
                <Grid item xs={12} md={7} lg={8} xl={9}>
                    {
                        subjects.length ?
                            <Grid spacing={1} align="center" container>

                                {
                                    subjects.map((subjectDoc, idx) => (
                                        <Grid onClick={() => handleOpenSubject(subjectDoc._id)} key={`subject-card-${idx}`} item xs={12} sm={6} md={4} lg={3} >
                                            <Card raised className={classes.card}>
                                                <CardActionArea >
                                                    <CardMedia
                                                        className={classes.cardMedia}
                                                        image="https://builtin.com/sites/default/files/styles/og/public/2019-04/big-data-education.png"
                                                        title="Blank"
                                                    />
                                                    <CardContent>
                                                        <Typography gutterBottom variant="h5" component="h2">
                                                            {subjectDoc.name}
                                                        </Typography>
                                                    </CardContent>
                                                </CardActionArea>
                                            </Card>
                                        </Grid>
                                    ))
                                }

                            </Grid>
                            :
                            <div style={{ display: "flex", width: "100%", height: "100%" }}>
                                <div style={{ margin: "auto" }}>
                                    <Typography className="flow-text" style={{ color: "grey" }} variant="h5">No subjects were found.</Typography>
                                    <p style={{ textAlign: "center", color: "grey" }}><FontAwesomeIcon icon={faChalkboardTeacher} size="5x" /></p>
                                </div>
                            </div>
                    }

                </Grid>

            </Grid>





        </div>

    );
}

export default UserPortal;