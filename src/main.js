const { ipcRenderer } = require("electron");
const { google } = require("googleapis");
const { driveGet } = require("./drive");

// Component for each section of Kilogram Exam desktop
const { QuestionPage } = require("./component/questionComponent.js");

class Account extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userImage: null,
      displayName: null,
      email: null
    };
    ipcRenderer.on("userInfo", (event, res) => {
      this.setState({
        userImage: res.data.photos[0].url,
        displayName: res.data.names[0].displayName,
        email: res.data.emailAddresses[0].value
      });
    });
  }

  render() {
    return (
      <span id="account">
        <img
          style={{ height: "20px", borderRadius: "50%" }}
          align="center"
          src={this.state.userImage}
        />
        <span id="account_detail"> {this.state.displayName}</span>
      </span>
    );
  }
}

function Header(props) {
  return (
    <div id="header">
      {props.value} <Account />
    </div>
  );
}

function Sidebar_Button(props) {
  return (
    <div
      className={"sidebar_bt " + props.className}
      onClick={() => props.onClick(props.name)}
    >
       {props.name}
    </div>
  );
}

function Sidebar(props) {
  function eachPageButton(menuList, props) {
    let menu = [];
    for (const key of Object.keys(menuList)) {
      menu.push(
        <Sidebar_Button
          key={key}
          name={key}
          onClick={() => props.onClick(key, props.menuList[key]["page"])}
          className={key == props.activePage ? "actived" : "not-active"}
        />
      );
    }
    return menu;
  }

  return <div id="sidebar">{eachPageButton(props.menuList, props)}</div>;
}

function ContentContainer(props) {
  return (
    <div id="content_container">
      <Header value={props.activePage} />
      <div className="content">{props.pageContent}</div>
    </div>
  );
}

function Dialog(props) {
  return (
    <div className="dialogContainer">
      <div className="dialog">{props.children}</div>
    </div>
  );
}

class SignIn_Button extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hovering: false
    };
  }

  render() {
    return (
      <img
        className="hover_pointer"
        onMouseOver={() => this.setState({ hovering: true })}
        onMouseOut={() => this.setState({ hovering: false })}
        onClick={() => {
          ipcRenderer.send(this.props.signinMethod);
        }}
        src={!this.state.hovering ? this.props.src : this.props.srcHover}
      />
    );
  }
}

class Container extends React.Component {
  constructor(props) {
    super(props);

    this.handleDialog = {
      open: msg => {
        this.setState({ dialogShown: true, dialogContent: msg });
      },
      close: res => {
        this.setState({
          dialogShown: false,
          pageContent: res ? res : this.state.pageContent
        });
      }
    };

    this.menu = {
      หน้าแรก: { page: null },
      ข้อสอบ: { page: <QuestionPage handleDialog={this.handleDialog} /> },
      นักเรียน: { page: null },
      สรุป: { page: null }
    };

    this.state = {
      menuList: this.menu,
      activePage: Object.keys(this.menu)[0],
      pageContent: this.menu[Object.keys(this.menu)[0]]["page"],
      dialogShown: true,
      dialogContent: (
        <SignIn_Button
          src="google_signin_buttons/web/1x/btn_google_signin_light_normal_web.png"
          srcHover="google_signin_buttons/web/1x/btn_google_signin_light_pressed_web.png"
          signinMethod="googleSignin"
        />
      )
    };
    ipcRenderer.on("signInSuccess", event => {
      this.setState({
        dialogShown: false
      });
    });

    this.handleClick = this.handleClick.bind(this);
    this.handleDialog.open = this.handleDialog.open.bind(this);
    this.handleDialog.close = this.handleDialog.close.bind(this);
  }

  handleClick(activeNum, page) {
    this.setState({
      activePage: activeNum,
      pageContent: page
    });
  }

  render() {
    return (
      <div id="container">
        {this.state.dialogShown ? (
          <Dialog>{this.state.dialogContent}</Dialog>
        ) : null}
        <Sidebar
          activePage={this.state.activePage}
          menuList={this.state.menuList}
          onClick={this.handleClick}
        />
        <ContentContainer
          activePage={this.state.activePage}
          pageContent={this.state.pageContent}
          menuList={this.state.menuList}
        />
      </div>
    );
  }
}

ReactDOM.render(<Container />, document.getElementById("root"));
