import { remote, ipcRenderer } from 'electron';
import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { test as testUtils } from 'utils';
import Header from 'components/Header';
import List from 'components/List';
import ListItem from 'components/ListItem';
import Status from 'components/Status';
import AddIcon from 'components/icons/Add';

import {
  project as projectUtil,
} from 'utils';

import * as globalActions from '../App/actions';

import * as actions from './actions';
import styles from './Selection.css';

class Selection extends Component {
  static defaultProps = {
    projects: [],
    selectProjectPath: () => {},
  }
  static propTypes = {
    projects: PropTypes.arrayOf(PropTypes.object),
    selectProjectPath: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
    };

    this.setProjectDir = this.setProjectDir.bind(this);
  }

  setProjectDir() {
    const { dialog } = remote;
    const dir = dialog.showOpenDialog({ properties: ['openDirectory'] });

    if (dir) {
      const [path] = dir;
      this.setState({ projectPath: path, results: {} }, () => {
        ipcRenderer.send('watch directory', path);
        ipcRenderer.send('execute test', path);
      });
    }
  }

  render() {
    const {
      projects,
      selectProjectPath,
    } = this.props;
    const links = projects.map((project) => {
      const { stats, updatedAt, projectPath } = project;
      const onClickHandler = () => selectProjectPath(project);

      return (
        <ListItem
          key={projectPath}
        >
          <Link
            className={styles.project}
            to="/project"
            onClick={onClickHandler}
          >
            <div>
              <div className={styles.projectPath}>
                {projectUtil.formatProjectName(projectPath)}
              </div>
              {updatedAt &&
                <div className={styles.updatedAt}>{testUtils.formatTime(updatedAt)}</div>
              }
            </div>
            <div className={styles.stats}>
              <Status type="passing">{stats.passes}</Status>
              <Status type="pending">{stats.pending}</Status>
              <Status type="failure">{stats.failures}</Status>
            </div>
          </Link>
        </ListItem>
      );
    });
    return (
      <div className={styles.base}>
        <Header
          title="Zest"
          leftControl={
            <AddIcon
              className={styles.addIcon}
              onClick={this.setProjectDir}
              size={18}
            />
          }
        />
        <div className={styles.title}>Projects</div>
        <List className={styles.selectionList}>
          {links}
        </List>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    projects: state.global.projects,
  };
}

export default connect(mapStateToProps, {
  ...globalActions,
  ...actions,
})(Selection);
