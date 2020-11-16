import React from "react";
import "./split-panel.styles.scss";


class SplitPanel extends React.Component {
  constructor(props) {
    super();
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);    
    this.containerRef = React.createRef();
    this.resizerRef = React.createRef();
    this.state = {
      vertical: props.direction==="v"?true:false,
      firstFlex: props.firstFlex,
      secondFlex: props.secondFlex,
      resizing: false,
      prevPos: 0,
      prevSize: 0,
      nextSize: 0,
      sumGrow: 0      
    };
  }

  componentDidMount() {
    // document.addEventListener("mousedown", this.handleMouseDown);
    document.addEventListener("mouseup", this.handleMouseUp);
    // document.addEventListener('mousemove', this.handleMouseMove);
  }
  componentWillUnmount() {
    //document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener("mousedown", this.handleMouseDown);
    // document.removeEventListener("mouseup", this.handleMouseUp);
  }

  handleMouseMove(e) {
    
    const {vertical} = this.state;
    e.preventDefault();

    let prevSize = this.state.prevSize;
    let nextSize = this.state.nextSize;

    var sumSize = prevSize + nextSize;

    let currentPos = vertical?e.pageY:e.pageX;
    if (this.state.prevPos === 0) this.setState({ prevPos: currentPos });
    else {
      let diff = currentPos - this.state.prevPos;

      prevSize += diff;
      nextSize -= diff;

      if (prevSize < 0) {
        nextSize += prevSize;
        currentPos -= prevSize;
        prevSize = 0;
      }
      if (nextSize < 0) {
        prevSize += nextSize;
        currentPos += nextSize;
        nextSize = 0;
      }

      var prevGrowNew = this.state.sumGrow * (prevSize / sumSize);
      var nextGrowNew = this.state.sumGrow * (nextSize / sumSize);

      // console.log(currentPos, this.state.prevPos, diff, prevSize, nextSize, prevGrowNew, nextGrowNew);

      this.setState({
        firstFlex: prevGrowNew,
        secondFlex: nextGrowNew,
      });

    }
  }

  handleMouseUp(e) {
    if (this.state.resizing) {
      document.removeEventListener("mousemove", this.handleMouseMove);
       console.log("end resizing");
      this.setState({ resizing: false });
    }
  }
  handleMouseDown(e) {
    const {vertical} = this.state;
    // console.log("this", this);
    if (e.target.className === "flex-resizer") {
      let prevSize = vertical ?
        this.resizerRef.current.offsetTop - this.containerRef.current.offsetTop:
        this.resizerRef.current.offsetLeft - this.containerRef.current.offsetLeft;
      let nextSize =  vertical ?
        (this.containerRef.current.offsetTop + this.containerRef.current.clientHeight) -
        this.resizerRef.current.offsetTop - 10:
        (this.containerRef.current.offsetLeft + this.containerRef.current.clientWidth) -
        this.resizerRef.current.offsetLeft - 10
        ;
      let sumGrow = this.state.firstFlex + this.state.secondFlex;
      let currentPos = vertical? e.pageY: e.pageX;

      this.setState({
        resizing: true,
        prevSize: prevSize,
        nextSize: nextSize,
        sumGrow: sumGrow,
        prevPos: currentPos
      });
      document.addEventListener("mousemove", this.handleMouseMove);
      console.log("start resizing", currentPos, prevSize, nextSize, this.state.firstFlex , this.state.secondFlex, sumGrow);
    }
  }


  render() {
    const {vertical} = this.state;
    const children = React.Children.toArray(this.props.children).slice(0, 2);
    if (children.length === 0) {
      children.push(<div />);
    }
    const wrappedChildren = [];
    const flexes = [this.state.firstFlex, this.state.secondFlex];
    const cursorClass = this.state.resizing?(vertical?" cursor-ns":" cursor-ew"  ):" cursor-default";
    for (let i = 0; i < children.length; ++i) {
      wrappedChildren.push(
        <div className={"flex-item" + cursorClass}   style={{ flex: flexes[i]} }>
          {children[i]}
        </div>
      );
    }
    return (

      <div className={"flex split-panel-container "+(vertical?"v":"h")}  ref={this.containerRef }>
        {wrappedChildren[0]}
        {wrappedChildren.length > 1 &&
          (
            <div className="flex-resizer" ref={this.resizerRef} 
            onMouseDown={this.handleMouseDown.bind(this)} 
            ></div>
          )
        }
        {wrappedChildren.length > 1 && wrappedChildren[1]}
      </div>

    );
  }


}

export default SplitPanel