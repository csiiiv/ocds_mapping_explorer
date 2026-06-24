import { useEffect, useMemo, useState } from "react";
import type { DataElementRow, DataSourceRow } from "../types";
import { buildForMappingLabel, createDataElementRow } from "../lib/inventory";
import { dataElementSectionTables, filterRealDataElements } from "../lib/dataElements";
import { DataSourceFormModal } from "./DataSourceFormModal";

export interface DataElementWizardResult {
  row: DataElementRow;
  selectForMapping?: boolean;
}

interface Props {
  dataSources: DataSourceRow[];
  dataElements?: DataElementRow[];
  initial?: DataElementRow | null;
  ocdsPathHint?: string;
  onSave: (result: DataElementWizardResult) => void;
  onAddDataSource: (row: DataSourceRow) => void;
  onClose: () => void;
}

export function DataElementWizard({
  dataSources,
  dataElements = [],
  initial,
  ocdsPathHint,
  onSave,
  onAddDataSource,
  onClose,
}: Props) {
  const [step, setStep] = useState(1);
  const [dataSource, setDataSource] = useState("");
  const [sectionTable, setSectionTable] = useState("");
  const [dataElement, setDataElement] = useState("");
  const [forMapping, setForMapping] = useState("");
  const [forMappingManual, setForMappingManual] = useState(false);
  const [publish, setPublish] = useState("Yes");
  const [dataType, setDataType] = useState("");
  const [example, setExample] = useState("");
  const [description, setDescription] = useState("");
  const [notes, setNotes] = useState("");
  const [mappingDetails, setMappingDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sourceFormOpen, setSourceFormOpen] = useState(false);

  useEffect(() => {
    if (initial) {
      setDataSource(initial.data_source);
      setSectionTable(initial.section_table);
      setDataElement(initial.data_element);
      setForMapping(initial.for_mapping);
      setForMappingManual(true);
      setPublish(initial.publish || "Yes");
      setDataType(initial.data_type);
      setExample(initial.example);
      setDescription(initial.description);
      setNotes(initial.notes);
      setMappingDetails(initial.mapping_details);
      setStep(1);
    } else {
      setDataSource(dataSources[0]?.data_source ?? "");
      setSectionTable("");
      setDataElement("");
      setForMapping("");
      setForMappingManual(false);
      setPublish("Yes");
      setDataType("");
      setExample("");
      setDescription("");
      setNotes("");
      setMappingDetails(ocdsPathHint ?? "");
      setStep(1);
    }
    setError(null);
  }, [initial, dataSources, ocdsPathHint]);

  const autoForMapping = useMemo(
    () => buildForMappingLabel(sectionTable, dataElement),
    [sectionTable, dataElement],
  );

  useEffect(() => {
    if (!forMappingManual) setForMapping(autoForMapping);
  }, [autoForMapping, forMappingManual]);

  const sourceOptions = useMemo(() => {
    const names = new Set<string>();
    for (const s of dataSources) {
      if (s.data_source) names.add(s.data_source);
    }
    if (dataSource) names.add(dataSource);
    return [...names].sort();
  }, [dataSources, dataSource]);

  const inventoryRows = useMemo(() => filterRealDataElements(dataElements), [dataElements]);

  const sectionTableSuggestions = useMemo(() => {
    const forSource = dataElementSectionTables(inventoryRows, dataSource);
    if (forSource.length || !dataSource.trim()) return forSource;
    return dataElementSectionTables(inventoryRows);
  }, [inventoryRows, dataSource]);

  const validateStep = (n: number): boolean => {
    if (n === 1 && !dataSource.trim()) {
      setError("Select or add a data source.");
      return false;
    }
    if (n === 2) {
      if (!sectionTable.trim()) {
        setError("Section / table is required.");
        return false;
      }
      if (!dataElement.trim()) {
        setError("Field name is required.");
        return false;
      }
    }
    setError(null);
    return true;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(3, s + 1));
  };

  const back = () => {
    setError(null);
    setStep((s) => Math.max(1, s - 1));
  };

  const submit = (selectForMapping: boolean) => {
    if (!validateStep(1) || !validateStep(2)) {
      setStep(1);
      return;
    }
    const row = createDataElementRow({
      data_source: dataSource,
      section_table: sectionTable,
      data_element: dataElement,
      for_mapping: forMappingManual ? forMapping : autoForMapping,
      publish,
      data_type: dataType,
      example,
      description,
      notes,
      mapping_details: mappingDetails,
    });
    if (initial) {
      const identityUnchanged =
        initial.section_table.trim() === sectionTable.trim() &&
        initial.data_element.trim() === dataElement.trim();
      if (identityUnchanged) row.key = initial.key;
    }
    if (!row.key || row.key === ".") {
      setError("Could not build element key — check table and field names.");
      return;
    }
    onSave({ row, selectForMapping });
    onClose();
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div>
              <h3>{initial ? "Edit data element" : "Add data element"}</h3>
              <div className="modal-subtitle">
                Step {step} of 3 — sheet &quot;2. Data Elements&quot; (OCP template)
              </div>
            </div>
            <button className="btn btn-ghost" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>

          <div className="wizard-steps">
            {["Source", "Field", "Details"].map((label, i) => (
              <span key={label} className={`wizard-step${step === i + 1 ? " active" : ""}${step > i + 1 ? " done" : ""}`}>
                {i + 1}. {label}
              </span>
            ))}
          </div>

          <div className="modal-body wizard-body">
            {error && <div className="callout callout-error">{error}</div>}

            {step === 1 && (
              <>
                <label>
                  Data source <span className="req">*</span>
                  <div className="mapping-edit">
                    <select value={dataSource} onChange={(e) => setDataSource(e.target.value)}>
                      <option value="">— Select —</option>
                      {sourceOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <button type="button" className="btn" onClick={() => setSourceFormOpen(true)}>
                      + New source
                    </button>
                  </div>
                </label>
                <p className="section-hint">
                  The system or database this field comes from. Add a data source first if your
                  system is not listed.
                </p>
              </>
            )}

            {step === 2 && (
              <div className="wizard-grid">
                <label>
                  Section / table <span className="req">*</span>
                  <input
                    list="de-section-table-suggestions"
                    value={sectionTable}
                    onChange={(e) => setSectionTable(e.target.value)}
                    placeholder="e.g. Tenders, invoices"
                    autoComplete="off"
                  />
                  {sectionTableSuggestions.length > 0 && (
                    <span className="field-hint">
                      {dataSource.trim()
                        ? `Suggestions from ${dataSource}`
                        : "Suggestions from existing inventory"}
                      {" "}({sectionTableSuggestions.length})
                    </span>
                  )}
                </label>
                <datalist id="de-section-table-suggestions">
                  {sectionTableSuggestions.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
                <label>
                  Data element (field) <span className="req">*</span>
                  <input
                    value={dataElement}
                    onChange={(e) => setDataElement(e.target.value)}
                    placeholder="e.g. tender_id"
                  />
                </label>
                <label className="span-2">
                  For mapping label <span className="req">*</span>
                  <div className="mapping-edit">
                    <input
                      value={forMappingManual ? forMapping : autoForMapping}
                      onChange={(e) => {
                        setForMappingManual(true);
                        setForMapping(e.target.value);
                      }}
                      placeholder="Auto-generated from table + field"
                    />
                    {!forMappingManual && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => setForMappingManual(true)}
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <span className="field-hint">Used when linking OCDS fields in the mapping explorer</span>
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="wizard-grid">
                <label>
                  Publish?
                  <select value={publish} onChange={(e) => setPublish(e.target.value)}>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </label>
                <label>
                  Data type
                  <input
                    value={dataType}
                    onChange={(e) => setDataType(e.target.value)}
                    placeholder="string, date, number…"
                  />
                </label>
                <label className="span-2">
                  Example
                  <input value={example} onChange={(e) => setExample(e.target.value)} />
                </label>
                <label className="span-2">
                  Description
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
                </label>
                <label className="span-2">
                  OCDS path hint <code>mapping_details</code>
                  <input
                    value={mappingDetails}
                    onChange={(e) => setMappingDetails(e.target.value)}
                    placeholder="e.g. tender/id"
                    className="mono"
                  />
                </label>
                <label className="span-2">
                  Notes
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
                </label>
              </div>
            )}
          </div>

          <div className="modal-footer">
            {step > 1 ? (
              <button type="button" className="btn btn-ghost" onClick={back}>
                Back
              </button>
            ) : (
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
            )}
            <div className="spacer" />
            {step < 3 ? (
              <button type="button" className="btn btn-primary" onClick={next}>
                Next
              </button>
            ) : (
              <>
                <button type="button" className="btn" onClick={() => submit(false)}>
                  Save element
                </button>
                {!initial && (
                  <button type="button" className="btn btn-primary" onClick={() => submit(true)}>
                    Save &amp; use in mapping
                  </button>
                )}
                {initial && (
                  <button type="button" className="btn btn-primary" onClick={() => submit(false)}>
                    Save changes
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {sourceFormOpen && (
        <DataSourceFormModal
          onSave={(row) => {
            onAddDataSource(row);
            setDataSource(row.data_source);
            setSourceFormOpen(false);
          }}
          onClose={() => setSourceFormOpen(false)}
        />
      )}
    </>
  );
}
