//
// This file was generated by the Eclipse Implementation of JAXB, v4.0.5 
// See https://eclipse-ee4j.github.io/jaxb-ri 
// Any modifications to this file will be lost upon recompilation of the source schema. 
//


package fi.vm.sade.oppijanumerorekisteri.vtjkysely.jaxb;

import java.util.ArrayList;
import java.util.List;
import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlAnyElement;
import jakarta.xml.bind.annotation.XmlElement;
import jakarta.xml.bind.annotation.XmlMixed;
import jakarta.xml.bind.annotation.XmlRootElement;
import jakarta.xml.bind.annotation.XmlType;


/**
 * <p>Java class for anonymous complex type</p>.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.</p>
 * 
 * <pre>{@code
 * <complexType>
 *   <complexContent>
 *     <restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       <sequence>
 *         <element name="TeeHenkilonTunnistusKyselyResult" minOccurs="0">
 *           <complexType>
 *             <complexContent>
 *               <restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *                 <sequence>
 *                   <any/>
 *                 </sequence>
 *               </restriction>
 *             </complexContent>
 *           </complexType>
 *         </element>
 *       </sequence>
 *     </restriction>
 *   </complexContent>
 * </complexType>
 * }</pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "teeHenkilonTunnistusKyselyResult"
})
@XmlRootElement(name = "TeeHenkilonTunnistusKyselyResponse")
public class TeeHenkilonTunnistusKyselyResponse {

    @XmlElement(name = "TeeHenkilonTunnistusKyselyResult")
    protected TeeHenkilonTunnistusKyselyResponse.TeeHenkilonTunnistusKyselyResult teeHenkilonTunnistusKyselyResult;

    /**
     * Gets the value of the teeHenkilonTunnistusKyselyResult property.
     * 
     * @return
     *     possible object is
     *     {@link TeeHenkilonTunnistusKyselyResponse.TeeHenkilonTunnistusKyselyResult }
     *     
     */
    public TeeHenkilonTunnistusKyselyResponse.TeeHenkilonTunnistusKyselyResult getTeeHenkilonTunnistusKyselyResult() {
        return teeHenkilonTunnistusKyselyResult;
    }

    /**
     * Sets the value of the teeHenkilonTunnistusKyselyResult property.
     * 
     * @param value
     *     allowed object is
     *     {@link TeeHenkilonTunnistusKyselyResponse.TeeHenkilonTunnistusKyselyResult }
     *     
     */
    public void setTeeHenkilonTunnistusKyselyResult(TeeHenkilonTunnistusKyselyResponse.TeeHenkilonTunnistusKyselyResult value) {
        this.teeHenkilonTunnistusKyselyResult = value;
    }


    /**
     * <p>Java class for anonymous complex type</p>.
     * 
     * <p>The following schema fragment specifies the expected content contained within this class.</p>
     * 
     * <pre>{@code
     * <complexType>
     *   <complexContent>
     *     <restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
     *       <sequence>
     *         <any/>
     *       </sequence>
     *     </restriction>
     *   </complexContent>
     * </complexType>
     * }</pre>
     * 
     * 
     */
    @XmlAccessorType(XmlAccessType.FIELD)
    @XmlType(name = "", propOrder = {
        "content"
    })
    public static class TeeHenkilonTunnistusKyselyResult {

        @XmlMixed
        @XmlAnyElement(lax = true)
        protected List<Object> content;

        /**
         * Gets the value of the content property.
         * 
         * <p>This accessor method returns a reference to the live list,
         * not a snapshot. Therefore any modification you make to the
         * returned list will be present inside the JAXB object.
         * This is why there is not a <CODE>set</CODE> method for the content property.</p>
         * 
         * <p>
         * For example, to add a new item, do as follows:
         * </p>
         * <pre>
         * getContent().add(newItem);
         * </pre>
         * 
         * 
         * <p>
         * Objects of the following type(s) are allowed in the list
         * {@link Object }
         * {@link String }
         * </p>
         * 
         * 
         * @return
         *     The value of the content property.
         */
        public List<Object> getContent() {
            if (content == null) {
                content = new ArrayList<>();
            }
            return this.content;
        }

    }

}
