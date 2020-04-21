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
    {key: 'Alpha', color: 'lightblue', geo: 'file'},
    {key: 'Beta', color: 'orange', geo: 'alarm'},
    {key: 'Gamma', color: 'lightgreen', geo: 'lab'},
    {key: 'Delta', color: 'pink', geo: 'earth'}
  ];
  public diagramLinkData: Array<go.ObjectData> = [
    {key: -1, from: 'Alpha', to: 'Beta', fromPort: 'r', toPort: '1'},
    {key: -2, from: 'Alpha', to: 'Gamma', fromPort: 'b', toPort: 't'},
    {key: -3, from: 'Beta', to: 'Beta'},
    {key: -4, from: 'Gamma', to: 'Delta', fromPort: 'r', toPort: 'l'},
    {key: -5, from: 'Delta', to: 'Alpha', fromPort: 't', toPort: 'r'}
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
      'undoManager.isEnabled': true,
      model: $(go.GraphLinksModel,
        {
          linkToPortIdProperty: 'toPort',
          linkFromPortIdProperty: 'fromPort',
          linkKeyProperty: 'key' // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
        }
      )
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
      $(go.Node, 'Auto',
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
        }
      );

    $(go.Node, 'Spot',
      $(go.Panel, 'Auto',
        $(go.Shape, 'Diamond', {stroke: null},
          new go.Binding('fill', 'color'),
          new go.Binding('fill', 'color')
        ),
        $(go.TextBlock, {margin: 8},
          new go.Binding('text', 'key'))
      ),
      // Ports
      makePort('t', go.Spot.TopCenter),
      makePort('l', go.Spot.Left),
      makePort('r', go.Spot.Right),
      makePort('b', go.Spot.BottomCenter)
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
        console.log(node);
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
