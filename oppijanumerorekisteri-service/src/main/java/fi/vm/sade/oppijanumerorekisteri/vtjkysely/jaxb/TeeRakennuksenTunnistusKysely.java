//
// This file was generated by the Eclipse Implementation of JAXB, v4.0.5 
// See https://eclipse-ee4j.github.io/jaxb-ri 
// Any modifications to this file will be lost upon recompilation of the source schema. 
//


package fi.vm.sade.oppijanumerorekisteri.vtjkysely.jaxb;

import jakarta.xml.bind.annotation.XmlAccessType;
import jakarta.xml.bind.annotation.XmlAccessorType;
import jakarta.xml.bind.annotation.XmlElement;
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
 *         <element name="SoSoNimi" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         <element name="Kayttajatunnus" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         <element name="Salasana" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         <element name="Loppukayttaja" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         <element name="Laskutustiedot" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         <element name="HakuXml" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *         <element name="Vara1" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
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
    "soSoNimi",
    "kayttajatunnus",
    "salasana",
    "loppukayttaja",
    "laskutustiedot",
    "hakuXml",
    "vara1"
})
@XmlRootElement(name = "TeeRakennuksenTunnistusKysely")
public class TeeRakennuksenTunnistusKysely {

    @XmlElement(name = "SoSoNimi")
    protected String soSoNimi;
    @XmlElement(name = "Kayttajatunnus")
    protected String kayttajatunnus;
    @XmlElement(name = "Salasana")
    protected String salasana;
    @XmlElement(name = "Loppukayttaja")
    protected String loppukayttaja;
    @XmlElement(name = "Laskutustiedot")
    protected String laskutustiedot;
    @XmlElement(name = "HakuXml")
    protected String hakuXml;
    @XmlElement(name = "Vara1")
    protected String vara1;

    /**
     * Gets the value of the soSoNimi property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSoSoNimi() {
        return soSoNimi;
    }

    /**
     * Sets the value of the soSoNimi property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSoSoNimi(String value) {
        this.soSoNimi = value;
    }

    /**
     * Gets the value of the kayttajatunnus property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getKayttajatunnus() {
        return kayttajatunnus;
    }

    /**
     * Sets the value of the kayttajatunnus property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setKayttajatunnus(String value) {
        this.kayttajatunnus = value;
    }

    /**
     * Gets the value of the salasana property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getSalasana() {
        return salasana;
    }

    /**
     * Sets the value of the salasana property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setSalasana(String value) {
        this.salasana = value;
    }

    /**
     * Gets the value of the loppukayttaja property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getLoppukayttaja() {
        return loppukayttaja;
    }

    /**
     * Sets the value of the loppukayttaja property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setLoppukayttaja(String value) {
        this.loppukayttaja = value;
    }

    /**
     * Gets the value of the laskutustiedot property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getLaskutustiedot() {
        return laskutustiedot;
    }

    /**
     * Sets the value of the laskutustiedot property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setLaskutustiedot(String value) {
        this.laskutustiedot = value;
    }

    /**
     * Gets the value of the hakuXml property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getHakuXml() {
        return hakuXml;
    }

    /**
     * Sets the value of the hakuXml property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setHakuXml(String value) {
        this.hakuXml = value;
    }

    /**
     * Gets the value of the vara1 property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getVara1() {
        return vara1;
    }

    /**
     * Sets the value of the vara1 property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setVara1(String value) {
        this.vara1 = value;
    }

}
