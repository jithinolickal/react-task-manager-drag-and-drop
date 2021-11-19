import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { initialData } from "./data";
import { useState } from "react";
import Column from "./Column";
import { DragDropContext, Droppable } from "react-beautiful-dnd";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
`;

// Perf Optimization - react memo/ Pure component
const InnerList = React.memo(({ column, taskMap, index }) => {
  const tasks = column.taskId.map((taskId) => taskMap[taskId]);
  return <Column key={column.id} column={column} tasks={tasks} index={index} />;
});

function App() {
  const [state, setstate] = useState(initialData);

  // triggers when a drag start
  const handleOnDragStart = (result) => {
    document.body.style.color = "orange";
  };

  // triggers when a drag is in progress
  const handleOnDragUpdate = (update) => {
    const { destination } = update;
    const opacity = destination
      ? destination.index / Object.keys(state.tasks).length
      : 0;
    document.body.style.backgroundColor = `rgba(153, 141, 217, ${opacity})`;
  };

  //reorder list after drag ends
  const handleOnDragEnd = (result) => {

    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    // Check if location of draggable changed. if true, the user droped back into taken position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // // Checking if outer column group is moved
    // if (type === "column") {
    //   const newColumnOrder = [...state.columnOrder];
    //   newColumnOrder.splice(source.index, 1);
    //   newColumnOrder.splice(destination.index, 0, draggableId);

    //   // Sets state with new state without modifying other properties, but by updating only the new column order
    //   const newState = {
    //     ...state,
    //     columnOrder: newColumnOrder,
    //   };
    //   setstate(newState);
    //   return; // Exit out of this iteration
    // }

    const start = state.columns[source.droppableId];
    const finish = state.columns[destination.droppableId];

    // Moving between same column
    if (start === finish) {
      const newTaskIds = [...start.taskId];

      newTaskIds.splice(source.index, 1); // Removes source index
      newTaskIds.splice(destination.index, 0, draggableId); // Adds draggableId item at destination index

      const newColumn = { ...start, taskId: newTaskIds }; // creates a new object for selected column with new task order

      // Sets state with new state without modifying other columns, but by adding only the new column value
      const newState = {
        ...state,
        columns: { ...state.columns, [newColumn.id]: newColumn },
      };
      setstate(newState);
      return; // Exit out of this iteration
    }

    // Moving from one column to another
    const startTaskIds = [...start.taskId];
    startTaskIds.splice(source.index, 1); // Removing item form first column
    const newStartColumn = { ...start, taskId: startTaskIds }; // First column with spliced task list

    const finishTaskIds = [...finish.taskId];
    finishTaskIds.splice(destination.index, 0, draggableId); // Adds draggableId item at second column
    const newFinishColumn = { ...finish, taskId: finishTaskIds }; // First column with spliced task list

    const newState = {
      ...state,
      columns: {
        ...state.columns,
        [newStartColumn.id]: newStartColumn,
        [newFinishColumn.id]: newFinishColumn,
      },
    };
    setstate(newState);
  };

  console.log(state);
  return (
    <DragDropContext
      onDragEnd={
        handleOnDragEnd
      } /* onDragStart={handleOnDragStart} onDragUpdate={handleOnDragUpdate} */
    >
      <Droppable droppableId="all-columns" direction="horizontal" type="column">
        {(provided) => (
          <Container ref={provided.innerRef} {...provided.droppableProps}>
            {state.columnOrder.map((columnId, index) => {
              const column = state.columns[columnId];

              return (
                <InnerList
                  key={column.id}
                  column={column}
                  taskMap={state.tasks}
                  index={index}
                />
              );
            })}
            {provided.placeholder}
          </Container>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default App;
