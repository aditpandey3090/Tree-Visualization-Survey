fetchProposedData().then(
    data => {
        console.log(data);
        appendTable();
        createSearchableTable(data);
        const tidyTree = generateTree(data);
        console.log(tidyTree);
    },
    error => console.log(error)
  );

  function appendTable() {
    $("body").append(
      '<table id="vizDataTable" class="display" width="100%"></table>'
    );
  }
  
  function createSearchableTable(dataSet) {
    $(document).ready(function() {
      $("#vizDataTable").DataTable({
        data: dataSet,
        order: [[3, "desc"]],
        columns: [
          {
            title: 'Task Description   <span><i class="fa fa-info-circle"></i></span>',
            data: "Task Description"
          },
          {
            title: 'Complex    <span><i class="fa fa-info-circle"></i></span>',
            data: "Complex"
          },
          {
            title:
              'Analyze(Consume)    <span><i class="fa fa-info-circle"></i></span>',
            data: "Analyze(Consume)"
          },
          {
            title:
              'Action(Search)     <i class="fa fa-info-circle"></i>',
            data: "Action(Search)"
          },
          {
            title: 'Action(Query)      <i class="fa fa-info-circle"></i> ',
            data: "Action(Query)"
          },
          {
            title: 'Target       <i class="fa fa-info-circle"></i> ',
            data: "Target"
          },
          {
            title: 'Specific Target    <span><i class="fa fa-info-circle"></i></span>',
            data: "Specific Target"
          },
          {
            title: 'Target Attribute    <span><i class="fa fa-info-circle"></i></span>',
            data: "Target Attribute"
          },
          {
            title: 'Target Attribute Descriptor    <span><i class="fa fa-info-circle"></i></span>',
            data: "Target Attribute Descriptor"
          }
        ],
        initComplete: function(settings) {
          $("#vizDataTable thead th").each(function() {
            var $td = $(this);
            $td.attr("title", $td.text());
          });
  
          /* Apply the tooltips */
          $("#vizDataTable thead th[title]").tooltip({
            container: "body"
          });
        }
      });
    });
  }

  /**
   * Converts the data in a tree structure
   * ├── Target
   * │    └── Specific Target
   * │        └── Target Attribute
   * 
   * @param {Object} data JSON data received from the proposed data sheet.
   */
  function generateTree(data) {
    const syntax = {
      name: ""
    };
    
    const root = {
      name: "Target",
      children: []
    };
    const attributeName = "Target";
    recurseNode(root, attributeName, 0);
    
    function recurseNode(root, attributeName, level, parentName, parentValue) {
      for (let i = 0; i < data.length; i++) {
        const currentData = data[i];
        const targetName = data[i][attributeName];
        if (level > 0 && currentData[parentName] !== parentValue) {
          continue;
        }
        let filteredList = root.children.filter(
          element => element.name === targetName
        );
        if (filteredList.length > 0 && level > 1) {
          let targetChild = undefined;
    
          targetChild = root.children.filter(x => x.name === targetName)[0];
    
          if (level === 0) {
            recurseNode(
              targetChild,
              "Specific Target",
              1,
              attributeName,
              targetName
            );
          } else if (level === 1) {
            recurseNode(
              targetChild,
              "Target Attribute",
              2,
              attributeName,
              targetName
            );
          } else if (level === 2) {
            targetChild.count = targetChild.count + 1;
          }
        } else if (filteredList.length === 0) {
          const targetNode = JSON.parse(JSON.stringify(syntax));
          targetNode.name = targetName;
          if (level < 2) {
            targetNode.children = [];
          } else {
            targetNode.count = 1;
          }
    
          root.children.push(targetNode);
    
          if (level === 0) {
            recurseNode(
              targetNode,
              "Specific Target",
              1,
              attributeName,
              targetName
            );
          } else if (level === 1) {
            recurseNode(
              targetNode,
              "Target Attribute",
              2,
              attributeName,
              targetName
            );
          }
        }
      }
    }
    
    return root;
  }