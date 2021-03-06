import { ipcRenderer } from 'electron';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import classNames from 'classnames/bind';
import Header from 'components/Header';
import List from 'components/List';
import ListItem from 'components/ListItem';
import Button from 'components/Button';
import Status from 'components/Status';
import PreviousIcon from 'components/icons/Previous';


import {
  project as projectUtil,
} from 'utils';

import * as actions from './actions';
import styles from './Project.css';

const cx = classNames.bind(styles);

class Project extends Component {
  static defaultProps = {
    project: {
      projectPath: '',
    },
  }

  constructor(props) {
    super(props);
    this.runTests = this.runTests.bind(this);
    this.state = {
      passesFilter: true,
      pendingFilter: true,
      failuresFilter: true,
    };

    this.togglePassing = this.toggleStatusFilter.bind(this, 'passes');
    this.togglePending = this.toggleStatusFilter.bind(this, 'pending');
    this.toggleFailures = this.toggleStatusFilter.bind(this, 'failures');
  }

  toggleStatusFilter(status) {
    console.log({
      [`${status}Filter`]: !this.state[`${status}Filter`],
    });
    this.setState({
      [`${status}Filter`]: !this.state[`${status}Filter`],
    });
  }

  runTests() {
    ipcRenderer.send('execute test', this.props.project.projectPath);
  }

  renderListItem(test, key, status) {
    let message;
    if (status === 'failure' && test.err) {
      message = test.err.message;
    }
    return (
      <ListItem className={styles.testListItem} key={key}>
        <div className={styles.testTitle}>
          <Status className={styles.testIcon} type={status} />
          <div>
            <div className={styles.fullTitle}>{test.fullTitle}</div>
            {message &&
              <div className={styles.errMessage}>{message}</div>
            }
          </div>
        </div>
        <div className={styles.duration}>{test.duration}ms</div>
      </ListItem>
    );
  }

  render() {
    const { project } = this.props;
    const { passes, pending, failures } = project;
    const {
      passesFilter,
      pendingFilter,
      failuresFilter,
    } = this.state;

    let passingListItems = [];
    let pendingListItems = [];
    let failuresListItems = [];


    if (passes) {
      passingListItems = passesFilter && passes.map((test, index) => passes && this.renderListItem(test, index, 'passing'));
      pendingListItems = pendingFilter && pending.map((test, index) => pending && this.renderListItem(test, index, 'pending'));
      failuresListItems = failuresFilter && failures.map((test, index) => failures && this.renderListItem(test, index, 'failure'));
    }

    return (
      <div className={styles.base}>
        <Header
          title={project && projectUtil.formatProjectName(project.projectPath)}
          leftControl={
            <Link to="/">
              <PreviousIcon
                size={18}
              />
            </Link>
          }
        />
        <div className={styles.status}>
          <div>{project.inProgress ? 'Busy' : 'Idle'}</div>
          <div className={styles.total}><span>{project.stats ? project.stats.tests : '-'}</span> Tests</div>
        </div>
        <div className={styles.stats}>
          <Status
            size="large"
            type="passing"
            className={cx({ inactive: !passesFilter })}
            onClick={this.togglePassing}
          >
            {project.stats ? project.stats.passes : '–'}<
            /Status>
          <Status
            size="large"
            type="pending"
            className={cx({ inactive: !pendingFilter })}
            onClick={this.togglePending}
          >
            {project.stats ? project.stats.pending : '–'}
          </Status>
          <Status
            size="large"
            type="failure"
            className={cx({ inactive: !failuresFilter })}
            onClick={this.toggleFailures}
          >
            {project.stats ? project.stats.failures : '–'
            }</Status>
        </div>

        <List className={styles.testList}>
          {passingListItems}
          {pendingListItems}
          {failuresListItems}
        </List>
        <div className={styles.action}>
          <Button onClick={this.runTests}>Run Tests</Button>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  const {
    projects,
    selectedProjectPath,
  } = state.global;
  const project = projects.find(({ projectPath }) => projectPath === selectedProjectPath);
  return {
    project,
  };
}

export default connect(mapStateToProps, actions)(Project);
