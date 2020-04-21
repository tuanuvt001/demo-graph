import {AfterViewInit, ChangeDetectorRef, Component, ViewChild, ViewEncapsulation} from '@angular/core';
import * as go from 'gojs';
import {DataSyncService, DiagramComponent, PaletteComponent} from 'gojs-angular';
import {icons} from '../assets/icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements AfterViewInit {

  constructor(private cdr: ChangeDetectorRef) {
  }

  @ViewChild('myDiagram', {static: true}) public myDiagramComponent: DiagramComponent;
  @ViewChild('myPalette', {static: true}) public myPaletteComponent: PaletteComponent;
  // a collection of colors
  colors = {
    blue: '#2a6dc0',
    orange: '#ea2857',
    green: '#1cc1bc',
    gray: '#5b5b5b',
    white: '#F5F5F5'
  };
  public diagramNodeData: Array<go.ObjectData> = [
    {key: 'u1.1', label: 'Ứng dụng 1', color: 'lightblue', geo: 'file', group: 'gr1.1'},
    {key: 'u1.2', label: 'Ứng dụng 2', color: 'orange', geo: 'alarm', group: 'gr1.1'},
    {key: 'u1.3', label: 'Ứng dụng 3', color: 'lightgreen', geo: 'lab', group: 'gr1.3'},
    {key: 'gr1', label: 'Analytic (BCG)', color: 'pink', isGroup: true},
    {key: 'gr1.1', label: 'Ứng dụng', color: 'pink', isGroup: true, group: 'gr1'},
    {key: 'gr1.2', label: 'Analytic Hive Metastore', color: 'pink', isGroup: true, group: 'gr1'},
    {key: 'gr1.3', label: 'Analytic Hdfs', color: 'pink', isGroup: true, group: 'gr1'},
    // DL DEV
    {key: 'gr2', label: 'DL Dev', color: 'pink', isGroup: true},
    {key: 'gr2.1', label: 'Ứng dụng', color: 'pink', isGroup: true, group: 'gr2'},
    {key: 'u2.1', label: 'Ứng dụng 1', color: 'lightblue', geo: 'file', group: 'gr2.1'},
    {key: 'u2.1', label: 'Ứng dụng 2', color: 'orange', geo: 'alarm', group: 'gr2.1'},
    {key: 'u2.3', label: 'Ứng dụng 3', color: 'lightgreen', geo: 'lab', group: 'gr2.1'},
    {key: 'gr2.2', label: 'Dev Metastore', color: 'pink', isGroup: true, group: 'gr2'},
    {key: 'gr2.3', label: 'Chia sẻ DL Dev', color: 'pink', isGroup: true, group: 'gr2'},
    {key: 'u2.3.1', label: 'Ứng dụng 1', color: 'lightblue', geo: 'file', group: 'gr2.3'},
    {key: 'u2.3.2', label: 'Ứng dụng 2', color: 'orange', geo: 'alarm', group: 'gr2.3'},

  ];
  public diagramLinkData: Array<go.ObjectData> = [
    {key: 'l1', from: 'gr1.3', to: 'gr2.3', fromPort: 'r', toPort: '1'},
  ];
  public diagramDivClassName = 'myDiagramDiv';
  public diagramModelData = {prop: 'value'};
  public paletteNodeData: Array<go.ObjectData> = [
    {key: 'PaletteNode1', color: 'firebrick'},
    {key: 'PaletteNode2', color: 'blueviolet'}
  ];
  public paletteLinkData: Array<go.ObjectData> = [
    {from: 'PaletteNode1', to: 'PaletteNode2'}
  ];
  public paletteModelData = {prop: 'val'};
  public paletteDivClassName = 'myPaletteDiv';

  // Overview Component testing
  public oDivClassName = 'myOverviewDiv';
  public observedDiagram = null;

  // currently selected node; for inspector
  public selectedNode: go.Node | null = null;

  // initialize diagram / templates
  public initDiagram(): go.Diagram {

    const $ = go.GraphObject.make;
    const dia = $(go.Diagram, {
      'undoManager.isEnabled': false,
      model: $(go.GraphLinksModel,
        {
          linkToPortIdProperty: 'toPort',
          linkFromPortIdProperty: 'fromPort',
          linkKeyProperty: 'key' // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
        }
      ),
      isReadOnly: true,
      initialAutoScale: go.Diagram.UniformToFill,
      padding: 10,
      layout: $(go.ForceDirectedLayout, {defaultSpringLength: 100, defaultElectricalCharge: 0}),
      maxSelectionCount: 2
    });

    const makePort = function(id: string, spot: go.Spot) {
      return $(go.Shape, 'Circle',
        {
          opacity: .5,
          fill: 'gray', strokeWidth: 0, desiredSize: new go.Size(8, 8),
          portId: id, alignment: spot,
          fromLinkable: true, toLinkable: true
        }
      );
    };

    function geoFunc(geoname) {
      let geo = icons[geoname];
      if (geo === undefined) {
        geo = icons.heart;
      }  // use this for an unknown icon name
      if (typeof geo === 'string') {
        geo = icons[geoname] = go.Geometry.parse(geo, true);  // fill each geometry
      }
      return geo;
    }

    // define the Node template
    dia.nodeTemplate =
      $(go.Node, 'Vertical',
        {locationObjectName: 'ICON'},
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, 'Spot',
          $(go.Panel, 'Auto',
            {name: 'ICON'},
            $(go.Shape, 'Circle',
              {fill: 'lightcoral', strokeWidth: 0, width: 65, height: 65},
              new go.Binding('fill', 'color')),
            $(go.Shape,
              {margin: 3, fill: '#ffffff', strokeWidth: 0},
              new go.Binding('geometry', 'geo', geoFunc)),
            // Each node has a tooltip that reveals the name of its icon
            {
              toolTip:
                $('ToolTip',
                  {'Border.stroke': '#ea2857', 'Border.strokeWidth': 2},
                  $(go.TextBlock, {margin: 8, stroke: '#ea2857', font: 'bold 16px sans-serif'},
                    new go.Binding('text', 'geo')))
            },
          ),  // end Spot Panel
        ), $(go.TextBlock,
          {margin: 5, font: 'Bold 14px Sans-Serif'},
          //the text, color, and key are all bound to the same property in the node data
          new go.Binding('text', 'label'))
      );

    // $(go.Node, 'Spot',
    //   $(go.Panel, 'Auto',
    //     $(go.Shape, 'Diamond', {stroke: null},
    //       new go.Binding('fill', 'color'),
    //       new go.Binding('fill', 'color')
    //     ),
    //     $(go.TextBlock, {margin: 8},
    //       new go.Binding('text', 'key'))
    //   ),
    //   // Ports
    //   makePort('t', go.Spot.TopCenter),
    //   makePort('l', go.Spot.Left),
    //   makePort('r', go.Spot.Right),
    //   makePort('b', go.Spot.BottomCenter)
    // );

    dia.groupTemplate =
      $(go.Group, 'Vertical',
        $(go.TextBlock,         // group title
          {alignment: go.Spot.TopCenter, font: 'Bold 12pt Sans-Serif'},
          new go.Binding('text', 'label')),
        $(go.Panel, 'Auto',
          $(go.Shape, 'RoundedRectangle',  // surrounds the Placeholder
            {
              parameter1: 14,
              fill: 'rgba(128,128,128,0.33)'
            }),
          $(go.Placeholder,    // represents the area of all member parts,
            {padding: 5})  // with some extra padding around them
        ),
      );

    dia.linkTemplate =
      $(go.Link,
        { routing: go.Link.AvoidsNodes },  // link route should avoid nodes
        $(go.Shape),
        $(go.Shape, { toArrow: "Standard" })
      );
    return dia;
  }

  // When the diagram model changes, update app data to reflect those changes
  public diagramModelChange = function(changes: go.IncrementalData) {
    this.diagramNodeData = DataSyncService.syncNodeData(changes, this.diagramNodeData);
    this.diagramLinkData = DataSyncService.syncLinkData(changes, this.diagramLinkData);
    this.diagramModelData = DataSyncService.syncModelData(changes, this.diagramModelData);
  };


  public initPalette(): go.Palette {
    const $ = go.GraphObject.make;
    const palette = $(go.Palette);

    // define the Node template
    palette.nodeTemplate =
      $(go.Node, 'Auto',
        $(go.Shape, 'RoundedRectangle',
          {
            stroke: null
          },
          new go.Binding('fill', 'color')
        ),
        $(go.TextBlock, {margin: 8},
          new go.Binding('text', 'key'))
      );

    palette.model = $(go.GraphLinksModel,
      {
        linkKeyProperty: 'key'  // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
      });

    return palette;
  }

  public paletteModelChange = function(changes: go.IncrementalData) {
    this.paletteNodeData = DataSyncService.syncNodeData(changes, this.paletteNodeData);
    this.paletteLinkData = DataSyncService.syncLinkData(changes, this.paletteLinkData);
    this.paletteModelData = DataSyncService.syncModelData(changes, this.paletteModelData);
  };

  public initOverview(): go.Overview {
    const $ = go.GraphObject.make;
    const overview = $(go.Overview);
    return overview;
  }

  public ngAfterViewInit() {

    if (this.observedDiagram) {
      return;
    }
    this.observedDiagram = this.myDiagramComponent.diagram;
    this.cdr.detectChanges(); // IMPORTANT: without this, Angular will throw ExpressionChangedAfterItHasBeenCheckedError (dev mode only)

    const appComp: AppComponent = this;
    // listener for inspector
    this.myDiagramComponent.diagram.addDiagramListener('ChangedSelection', function(e) {
      if (e.diagram.selection.count === 0) {
        appComp.selectedNode = null;
      }
      const node = e.diagram.selection.first();
      if (node instanceof go.Node) {
        appComp.selectedNode = node;
        alert(node.key);
      } else if (node instanceof go.Link) {
        alert(node.key);
      } else {
        appComp.selectedNode = null;
      }
    });
  } // end ngAfterViewInit


  public handleInspectorChange(newNodeData) {
    const key = newNodeData.key;
    // find the entry in nodeDataArray with this key, replace it with newNodeData
    let index = null;
    for (let i = 0; i < this.diagramNodeData.length; i++) {
      const entry = this.diagramNodeData[i];
      if (entry.key && entry.key === key) {
        index = i;
      }
    }

    if (index >= 0) {
      this.diagramNodeData[index] = {key: newNodeData.key, color: newNodeData.color};
    }
  }


}
