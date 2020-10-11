//TODO: При большом количестве элементов выделение элемента в конце списка тормозит - оптимизировать поиск элемента с нужным индексом

import React from "react";
const PAGE_SIZE=60;

function withContainer(WrappedComponent) {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state={
        changes: {},
        selected: [],
        multiselect: props.multiselect?true:false,
        displayedItemsCount: PAGE_SIZE
      };
      this.handleItemClick = this.handleItemClick.bind(this);
      this.handleItemChange = this.handleItemChange.bind(this);
      this.handleSetEditableFields = this.handleSetEditableFields.bind(this);
      this.handleSelectedAction = this.handleSelectedAction.bind(this);
      this.handleItemAction = this.handleItemAction.bind(this);
			this.itemField = this.itemField.bind(this);
      this.handleSelectItem = this.handleSelectItem.bind(this);
      this.handleSelectAll = this.handleSelectAll.bind(this);
      this.handleInvertSelection = this.handleInvertSelection.bind(this);
      this.handleScroll = this.handleScroll.bind(this);
    }

    static getDerivedStateFromProps(props, state) {
      if (props.data !== state.originalData) {
        // console.log("getDerivedStateFromProps", props, state);
        let changes ={};
        let data=[];
        let selected=[];

        if(props.initialSelectAll) {

          props.data.forEach((item, index) => {changes["selected" + index.toString()+"Value"]=true })
          data = props.data.map((obj, index)=> ({ ...obj, selected: true, index:index }));
          selected =  data.map((item)=> item);

        } else {
          props.data.forEach((item, index) => {changes["selected" + index.toString()+"Value"]=false });
          data = props.data.map((obj, index)=> ({ ...obj, selected: false, index:index }));
        }

        return {
          originalData: props.data,
          data, changes, selected
        };
      }
      return null;
    }


    itemField = (key, item, index) => {
      const stateFieldKey = key + index.toString() + "Value";
      // console.log( key + index.toString(), stateFieldKey, this.state.changes[stateFieldKey] );
      return({fieldKey: key + index.toString(), fieldValue: this.state.changes[stateFieldKey] });
    }

    handleSelectedAction = (action, selectKey) => {
      // console.log("handleSelectedAction", action, selectKey);
      let changed = this.state.data.map((item, index) => this.getChangedItem(item, index));
      let selected = changed.filter((item)=> item[selectKey]===true);
      this.props.handleAction(selected, action);
    }

    handleItemDoubleClick = (event, paramId) => {
      event.stopPropagation();
      const eventCheckedStateItemName = paramId + "Value";
      const selectedIndex = parseInt( paramId.replace("selected", ""),10); //конечно, не очень хорошо, но работает
      console.log("handleDoubleClickItem", event.target, paramId, eventCheckedStateItemName, selectedIndex);
      this.props.handleAction(this.props.data[selectedIndex], "doubleClick");
    }

		handleSelectItem = (event, paramId) => {
      event.stopPropagation();
      const eventCheckedStateItemName = paramId + "Value";

      const selected = this.state.changes[eventCheckedStateItemName];
      const selectedIndex = parseInt( paramId.replace("selected", ""),10); //конечно, не очень хорошо, но работает
      console.log("handleSelectItem", event.target, paramId, eventCheckedStateItemName, selectedIndex);
      let firstOrSame = false;

      if(this.state.selected.length===0) firstOrSame=true;
      else {
          const prevSelected = this.state.selected[0].index;
          if (selectedIndex === prevSelected) firstOrSame=true;
        }


      if (this.state.multiselect || firstOrSame) {
        this.setState({ changes: {
          ...this.state.changes,
          [eventCheckedStateItemName]: !selected
        },
        },
          ()=> this.afterSelect()
        );
      }
      else {
        // console.log("toggle",
        //   "selected"+this.state.selected[0].index.toString()+"Value",
        //   eventCheckedStateItemName);

        this.setState({ changes: {
          ...this.state.changes,
          ["selected"+this.state.selected[0].index.toString()+"Value"]: false,
          [eventCheckedStateItemName]: true
          }
        }, ()=> this.afterSelect()
        );

      }

		}

    afterSelect = () => {
      let changed = this.state.data.map((item, index) => this.getChangedItem(item, item.index));
      // console.log("changed", changed);
      let selected = changed.filter((item)=> item["selected"]===true);
      this.setState({selected: selected})
      let selectedOriginal = selected.map((item, index) => this.props.data[item.index]);
      console.log("selected", selected, "selectedOriginal", selectedOriginal);
      this.props.handleAction(selectedOriginal, "select");
    }

    handleItemAction = (item, index, action) => this.props.handleAction([this.getChangedItem(item, index)], action);



    getChangedItem = (item, index) => {
      let changedItem = {};
      for (const key in item) {
        if (item.hasOwnProperty(key)) {

          const value=item[key];
          const stateValue = this.state.changes[key + index.toString() +"Value"];
          changedItem[key] = stateValue!==undefined?stateValue:value;
        }
      }
      return changedItem;
    }

    handleItemClick = (item, index) => {
      console.log("clicked ", item);
     let clicked ={};
     Object.keys(item).forEach((key)=>{

       const value=item[key];
       const stateValue = this.state.changes[key + index.toString() +"Value"];
      //  console.log("key", key, value, stateValue );
       if (stateValue!== undefined)
       {
         clicked[key] = stateValue;
       }
       else
       {
         clicked[key]=value;
       }
     })
     this.props.handleClick(clicked);
   }

    handleItemChange = (event, paramId, type) => {
      console.log( "handleItemChange" ,event, event.target);
      const eventChangedStateItemName = paramId + "Value";
      switch (type) {
        case "checkbox":
          this.setState(
            { changes: {
              ...this.state.changes,
              [eventChangedStateItemName]: !this.state.changes[eventChangedStateItemName]
            }
            /*[eventChangedStateItemName]: !this.state.changes[eventChangedStateItemName],*/
          }
          );
          break;
          default:
            this.setState({
               changes: {
                ...this.state.changes,
                [eventChangedStateItemName]: event.target.value
              }
            //  [eventChangedStateItemName]: event.target.value,
            });
            break;
        }
		}



    handleSetEditableFields = (values) =>{
      let initialValues={};
      values.forEach((key) => {
        this.state.data.forEach((item,index) => {
          const stateFieldKey = key + index.toString() + "Value";
          initialValues[stateFieldKey]=item[key];
        })

      })
      // console.log("initialValues", initialValues);
      this.setState({
        changes: {
          ...this.state.changes,
          initialValues
        }
      }
        )       ;
    };

    handleClearSelection = () => {
      const selectedKeys = Object.keys(this.state.changes).filter((key)=> key.startsWith("selected"));
      const clearSelection = Object.fromEntries( selectedKeys.map((item, index) => ([[item], false]) ));
      // console.log("handleClearSelection",selectedKeys,  clearSelection);
     this.setState({
      changes: {  ...this.state.changes, ...clearSelection },
      selected: [],
      data: this.state.data.map((item)=>({...item, selected:false}))
      }
      );
      this.props.handleAction([], "select");
    }

    handleSelectAll = () => {
      const selectedKeys = Object.keys(this.state.changes).filter((key)=> key.startsWith("selected"));
      const selection = Object.fromEntries( selectedKeys.map((item, index) => ([[item], true]) ));
      // console.log("handleClearSelection",selectedKeys,  clearSelection);
      console.log(this.state.data.map((item)=> ({...item, selected: true})))
      this.setState({
        changes: {  ...this.state.changes, ...selection },
        data: this.state.data.map((item)=> ({...item, selected: true})),
      }, () =>this.setState({selected: this.state.data.map((item)=> item)})
        );

      let selectedOriginal =  this.props.data;
      this.props.handleAction(selectedOriginal, "select");
    }

    handleInvertSelection = () => {

    }

    handleScroll = e => {

      let element = e.target;
      // console.log("scroll", element.scrollHeight - element.scrollTop , element.clientHeight);
      if (element.scrollHeight - element.scrollTop - 100 < element.clientHeight) {
        // console.log("end");
        this.setState({displayedItemsCount: this.state.displayedItemsCount+PAGE_SIZE});
      }
    };

    render() {
        return <WrappedComponent
        handleAction={this.handleAction}
        handleItemClick={this.handleItemClick}
        handleItemDoubleClick={this.handleItemDoubleClick}
        handleItemChange={this.handleItemChange}
        handleSetEditableFields={this.handleSetEditableFields}
        handleSelectedAction={this.handleSelectedAction}
				handleItemAction={this.handleItemAction}
        handleSelectItem={this.handleSelectItem}
        handleClearSelection={this.handleClearSelection}
        handleSelectAll={this.handleSelectAll}
        handleInvertSelection={this.handleInvertSelection}
        itemField={this.itemField}
        innerData={this.state.data}
        selected={this.state.selected}
        handleScroll={this.handleScroll}
        displayedItemsCount={this.state.displayedItemsCount}
        {...this.props} />;
    }
  };
}

export default withContainer;
