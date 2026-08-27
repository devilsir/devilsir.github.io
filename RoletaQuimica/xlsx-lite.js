(function(global){
  'use strict';
  const enc=new TextEncoder();
  const STYLE={default:0,header:1,title:2,label:3,good:4,bad:5};
  const xmlEsc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const colName=n=>{let s='';while(n>0){n--;s=String.fromCharCode(65+n%26)+s;n=Math.floor(n/26)}return s};
  function safeSheetName(name,fallback){
    let s=String(name||fallback||'Planilha').replace(/[\\\/?*\[\]:]/g,' ').replace(/\s+/g,' ').trim();
    if(!s)s=String(fallback||'Planilha');
    return s.slice(0,31);
  }
  function uniqueNames(sheets){
    const used=new Set();
    return sheets.map((sh,i)=>{
      const base=safeSheetName(sh.name,`Partida ${i+1}`);
      let name=base,n=2;
      while(used.has(name.toLocaleLowerCase('pt-BR'))){
        const suffix=` (${n++})`;
        name=(base.slice(0,31-suffix.length)+suffix);
      }
      used.add(name.toLocaleLowerCase('pt-BR'));
      return {...sh,name};
    });
  }
  function cellXml(col,row,input){
    let value=input,style=0;
    if(input&&typeof input==='object'&&!Array.isArray(input)&&Object.prototype.hasOwnProperty.call(input,'v')){
      value=input.v;style=(STYLE[input.style]??Number(input.style))||0;
    }
    const r=`${colName(col)}${row}`,s=style?` s="${style}"`:'';
    if(value===null||value===undefined||value==='')return `<c r="${r}"${s} t="inlineStr"><is><t></t></is></c>`;
    if(typeof value==='number'&&Number.isFinite(value))return `<c r="${r}"${s}><v>${value}</v></c>`;
    if(typeof value==='boolean')return `<c r="${r}"${s} t="b"><v>${value?1:0}</v></c>`;
    const text=String(value),preserve=(/^\s|\s$|\n/.test(text))?' xml:space="preserve"':'';
    return `<c r="${r}"${s} t="inlineStr"><is><t${preserve}>${xmlEsc(text)}</t></is></c>`;
  }
  function sheetXml(sheet){
    const rows=Array.isArray(sheet.rows)?sheet.rows:[];
    const widths=Array.isArray(sheet.colWidths)?sheet.colWidths:[];
    const cols=widths.length?`<cols>${widths.map((w,i)=>`<col min="${i+1}" max="${i+1}" width="${Math.max(4,Math.min(60,Number(w)||12))}" customWidth="1"/>`).join('')}</cols>`:'';
    const data=rows.map((row,ri)=>`<row r="${ri+1}">${(Array.isArray(row)?row:[row]).map((v,ci)=>cellXml(ci+1,ri+1,v)).join('')}</row>`).join('');
    const merges=Array.isArray(sheet.merges)&&sheet.merges.length?`<mergeCells count="${sheet.merges.length}">${sheet.merges.map(r=>`<mergeCell ref="${xmlEsc(r)}"/>`).join('')}</mergeCells>`:'';
    const freeze=Math.max(0,Number(sheet.freezeRows)||0);
    const view=freeze?`<sheetViews><sheetView workbookViewId="0"><pane ySplit="${freeze}" topLeftCell="A${freeze+1}" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>`:'<sheetViews><sheetView workbookViewId="0"/></sheetViews>';
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">${view}<sheetFormatPr defaultRowHeight="15"/>${cols}<sheetData>${data}</sheetData>${merges}</worksheet>`;
  }
  const stylesXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="4">
    <font><sz val="11"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font>
    <font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="Calibri"/></font>
    <font><b/><color rgb="FFFFB35B"/><sz val="16"/><name val="Calibri"/></font>
    <font><b/><color rgb="FF3A1708"/><sz val="11"/><name val="Calibri"/></font>
  </fonts>
  <fills count="6">
    <fill><patternFill patternType="none"/></fill>
    <fill><patternFill patternType="gray125"/></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF6B2A00"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FF2F1308"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFE9F7EF"/><bgColor indexed="64"/></patternFill></fill>
    <fill><patternFill patternType="solid"><fgColor rgb="FFFDECEC"/><bgColor indexed="64"/></patternFill></fill>
  </fills>
  <borders count="2">
    <border><left/><right/><top/><bottom/><diagonal/></border>
    <border><left style="thin"><color rgb="FFD7B18A"/></left><right style="thin"><color rgb="FFD7B18A"/></right><top style="thin"><color rgb="FFD7B18A"/></top><bottom style="thin"><color rgb="FFD7B18A"/></bottom><diagonal/></border>
  </borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="6">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="4" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
    <xf numFmtId="0" fontId="3" fillId="5" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf>
  </cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
  <dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>`;
  function crcTable(){
    const t=new Uint32Array(256);
    for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);t[n]=c>>>0}
    return t;
  }
  const CRC=crcTable();
  function crc32(bytes){let c=0xFFFFFFFF;for(const b of bytes)c=CRC[(c^b)&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
  function le16(n){const a=new Uint8Array(2);new DataView(a.buffer).setUint16(0,n,true);return a}
  function le32(n){const a=new Uint8Array(4);new DataView(a.buffer).setUint32(0,n>>>0,true);return a}
  function cat(parts){const len=parts.reduce((n,p)=>n+p.length,0),out=new Uint8Array(len);let o=0;for(const p of parts){out.set(p,o);o+=p.length}return out}
  function dosNow(){const d=new Date(),year=Math.max(1980,d.getFullYear());return {time:(d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1),date:((year-1980)<<9)|((d.getMonth()+1)<<5)|d.getDate()}}
  function zipStore(files){
    const locals=[],centrals=[];let offset=0;const dt=dosNow();
    for(const f of files){
      const name=enc.encode(f.name),data=typeof f.data==='string'?enc.encode(f.data):f.data,crc=crc32(data),flags=0x0800;
      const local=cat([le32(0x04034b50),le16(20),le16(flags),le16(0),le16(dt.time),le16(dt.date),le32(crc),le32(data.length),le32(data.length),le16(name.length),le16(0),name]);
      locals.push(local,data);
      const central=cat([le32(0x02014b50),le16(20),le16(20),le16(flags),le16(0),le16(dt.time),le16(dt.date),le32(crc),le32(data.length),le32(data.length),le16(name.length),le16(0),le16(0),le16(0),le16(0),le32(0),le32(offset),name]);
      centrals.push(central);offset+=local.length+data.length;
    }
    const centralBytes=cat(centrals),localBytes=cat(locals);
    const eocd=cat([le32(0x06054b50),le16(0),le16(0),le16(files.length),le16(files.length),le32(centralBytes.length),le32(localBytes.length),le16(0)]);
    return new Blob([localBytes,centralBytes,eocd],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
  }
  function createWorkbookBlob(inputSheets){
    const sheets=uniqueNames((inputSheets||[]).length?inputSheets:[{name:'Histórico',rows:[['Sem dados']]}]);
    const workbook=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets>${sheets.map((s,i)=>`<sheet name="${xmlEsc(s.name)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join('')}</sheets></workbook>`;
    const rels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((s,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join('')}<Relationship Id="rId${sheets.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`;
    const contentTypes=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((s,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join('')}</Types>`;
    const rootRels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
    const files=[
      {name:'[Content_Types].xml',data:contentTypes},
      {name:'_rels/.rels',data:rootRels},
      {name:'xl/workbook.xml',data:workbook},
      {name:'xl/_rels/workbook.xml.rels',data:rels},
      {name:'xl/styles.xml',data:stylesXml},
      ...sheets.map((s,i)=>({name:`xl/worksheets/sheet${i+1}.xml`,data:sheetXml(s)}))
    ];
    return zipStore(files);
  }
  global.XLSXLite={createWorkbookBlob,safeSheetName,cell:(v,style='default')=>({v,style})};
})(typeof window!=='undefined'?window:globalThis);
