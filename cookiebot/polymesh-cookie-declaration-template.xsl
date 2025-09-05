<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
	<xsl:output method="html" omit-xml-declaration="yes" ></xsl:output>
	<xsl:template match="/">
		<style type="text/css">
			/*
			  Cookie Declaration - Professional Theme-Aware Styling
			  Leverages comprehensive CSS custom properties injected by the app for seamless light/dark theme support
			  All colors, spacing, and effects automatically adapt to current theme
			*/
			/* Main container - theme-aware layout */

			.CookieDeclaration {
				color: var(--cookiebot-text-primary, #1E1E1E);
				font-family: 'Poppins', sans-serif;
				font-size: 14px;
				line-height: 1.6;
				max-width: 900px;
				margin: 0 auto;
				padding: 32px 24px;
			}
			
			/* Responsive container adjustments */
			@media screen and (max-width: 1024px) {
				.CookieDeclaration {
					padding: 24px 16px;
				}
			}
			
			@media screen and (max-width: 768px) {
				.CookieDeclaration {
					padding: 16px;
				}
			}

			/* Link styling with theme support */
			.CookieDeclaration a {
				color: var(--cookiebot-button-text, #FF2E72);
				text-decoration: none;
				transition: color 150ms ease-out, text-decoration 150ms ease-out;
			}
			.CookieDeclaration a:hover,
			.CookieDeclaration a:focus {
				text-decoration: underline;
				color: var(--cookiebot-button-text, #FF2E72);
			}
			.CookieDeclaration a:focus { 
				outline: 2px solid var(--cookiebot-focus-border, #FF2E72); 
				outline-offset: 2px; 
				border-radius: 4px;
			}

			/* Typography - dialog text and intro use primary color for consistency */
			.CookieDeclarationDialogText,
			.CookieDeclarationIntro {
				margin: 0 0 24px 0;
				color: var(--cookiebot-text-primary, #1E1E1E);
				line-height: 1.6;
			}
			
			
			/* Last updated uses secondary color as it's truly secondary info */
			.CookieDeclarationLastUpdated {
				margin: 0 0 32px 0;
				color: var(--cookiebot-text-secondary, #727272);
				line-height: 1.6;
				font-size: 13px;
			}

			/* Intro section - flat design without card styling */
			.CookieDeclarationIntroCard {
				background: transparent;
				border: none;
				border-radius: 0;
				box-shadow: none;
				padding: 0;
				margin: 0 0 32px 0;
			}
			
			@media screen and (max-width: 768px) {
				.CookieDeclarationIntroCard {
					margin: 0 0 24px 0;
				}
			}
			.CookieDeclarationIntroCard p { 
				margin: 0 0 16px 0; 
				line-height: 1.6;
			}
			.CookieDeclarationIntroCard p:last-child { 
				margin-bottom: 0; 
			}

            /* User status panel - completely flat, no borders */
            #CookieDeclarationUserStatusPanel, #CookieDeclarationUserStatusLabel {
                background: transparent;
                border: none;
                border-radius: 0;
                box-shadow: none;
                padding: 0;
                margin: 0 0 32px 0;
            }
            
            /* Clean, flat styling for user status panel */
            #CookieDeclarationUserStatusPanel {
                background: transparent;
                border: none;
                border-radius: 0;
                padding: 0;
                margin-bottom: 24px;
                box-shadow: none;
            }
            
            /* Ensure all text within status panel uses secondary color, except links */
            #CookieDeclarationUserStatusPanel *:not(a) {
                color: var(--cookiebot-text-secondary, #727272) !important;
                font-weight: normal !important;
            }
            
            /* Preserve link styling within status panel */
            #CookieDeclarationUserStatusPanel a {
                color: var(--cookiebot-button-text, #FF2E72) !important;
                text-decoration: none !important;
                font-weight: normal !important;
            }
            
            #CookieDeclarationUserStatusPanel a:hover,
            #CookieDeclarationUserStatusPanel a:focus {
                text-decoration: underline !important;
                color: var(--cookiebot-button-text, #FF2E72) !important;
            }
            
            /* Clean paragraph styling with reduced spacing */
            #CookieDeclarationUserStatusPanel p {
                margin: 0 0 8px 0 !important;
                line-height: 1.5 !important;
                font-size: 14px !important;
                font-weight: normal !important;
                color: var(--cookiebot-text-secondary, #727272) !important;
            }
            
            /* First paragraph - clean status indicator */
            #CookieDeclarationUserStatusPanel p:first-child {
                margin-bottom: 12px !important;
                font-size: 13px !important;
                font-weight: normal !important;
                color: var(--cookiebot-text-secondary, #727272) !important;
            }
            
            /* Specific targeting for all current state labels */
            #CookieDeclarationUserStatusLabelOff,
            #CookieDeclarationUserStatusLabelOffDoNotSell, 
            #CookieDeclarationUserStatusLabelOn,
            #CookieDeclarationConsentIdAndDate {
                color: var(--cookiebot-text-primary, #FBFBFB) !important;
                font-weight: normal !important;
            }
            
            /* Extract and style the status from first paragraph */
            #CookieDeclarationUserStatusPanel p:first-child::before {
                content: "Current State:";
                display: inline;
                font-weight: 600;
                color: var(--cookiebot-text-secondary, #727272);
                margin-right: 8px;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            /* Second paragraph - consent ID with clean code styling */
            #CookieDeclarationUserStatusPanel p:nth-child(2) {
                background: var(--cookiebot-hover-bg, #F8F9FA);
                border: 1px solid var(--cookiebot-border-color, #E0E0E0);
                border-radius: 6px;
                padding: 12px;
                font-family: 'SF Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                font-size: 11px;
                word-break: break-all;
                margin: 12px 0;
                position: relative;
            }
            
            #CookieDeclarationUserStatusPanel p:nth-child(2)::before {
                content: "Consent ID";
                position: absolute;
                top: -8px;
                left: 12px;
                background: var(--cookiebot-card-bg-color, #FFFFFF);
                padding: 0 6px;
                font-size: 10px;
                font-weight: 600;
                color: var(--cookiebot-text-secondary, #727272);
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-family: 'Poppins', sans-serif;
            }
            
            /* Third paragraph - consent date */
            #CookieDeclarationUserStatusPanel p:nth-child(3)::before {
                content: "Consent Date: ";
                font-weight: 600;
                color: var(--cookiebot-text-secondary, #727272);
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            /* Enhanced key/value layout with better spacing */
            #CookieDeclarationUserStatusLabel { 
            	display: grid; 
            	grid-template-columns: minmax(160px, 240px) 1fr; 
            	column-gap: 16px; 
            	row-gap: 16px; 
            	align-items: center; 
            }
            #CookieDeclarationUserStatusLabel dt, #CookieDeclarationUserStatusLabel dd { 
            	margin: 0; 
            }
            #CookieDeclarationUserStatusLabel dt { 
            	grid-column: 1; 
            	font-weight: 600; 
            	color: var(--cookiebot-text-secondary, #727272); 
            	font-size: 13px;
            	text-transform: uppercase;
            	letter-spacing: 0.5px;
            }
            #CookieDeclarationUserStatusLabel dd { 
            	grid-column: 2; 
            	color: var(--cookiebot-text-secondary, #727272); 
            	font-size: 14px;
            	font-weight: normal;
            }
            #CookieDeclarationUserStatusLabelConsentId { 
            	text-overflow: ellipsis; 
            	word-wrap: break-word; 
            }
            
            /* Mobile responsive adjustments for status panel */
            @media screen and (max-width: 768px) {
                #CookieDeclarationUserStatusPanel, #CookieDeclarationUserStatusLabel {
                    padding: 20px;
                    margin: 0 0 24px 0;
                }
                #CookieDeclarationUserStatusLabel {
                    grid-template-columns: 1fr;
                    gap: 12px;
                }
                #CookieDeclarationUserStatusLabel dt,
                #CookieDeclarationUserStatusLabel dd {
                    grid-column: 1;
                }
            }
			/* Enhanced code styling for consent ID */
			.CookieDeclarationCode {
				display: inline-flex;
				gap: 10px;
				align-items: center;
				padding: 12px 16px;
				background: var(--cookiebot-code-bg, var(--cookiebot-hover-bg, rgba(0, 0, 0, 0.05)));
				border: 1px solid var(--cookiebot-code-border, var(--cookiebot-border-color, #E0E0E0));
				border-radius: 8px;
				font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
				font-size: 12px;
				color: var(--cookiebot-text-primary, #1E1E1E);
				transition: all 150ms ease-out;
				box-shadow: 0 1px 3px var(--cookiebot-shadow-color, rgba(30, 30, 30, 0.05));
				margin-top: 4px;
			}
			
			.CookieDeclarationCode:hover {
				border-color: var(--cookiebot-button-text, #FF2E72);
				box-shadow: 0 2px 6px var(--cookiebot-shadow-color, rgba(30, 30, 30, 0.1));
			}
            .CookieDeclarationCode code { 
            	background: transparent; 
            	padding: 0;
            	margin: 0;
            }
            
            /* Professional copy button styling */
            .CookieCopyBtn {
                appearance: none;
                border: 1px solid var(--cookiebot-border-color, #E0E0E0);
                background: var(--cookiebot-card-bg-color, #FFFFFF);
                color: var(--cookiebot-text-primary, #1E1E1E);
                font-size: 11px;
                font-weight: 600;
                padding: 6px 12px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 150ms ease-out;
                min-width: 50px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                box-shadow: 0 1px 2px var(--cookiebot-shadow-color, rgba(30, 30, 30, 0.05));
            }
            .CookieCopyBtn:hover { 
            	background: var(--cookiebot-button-hover-bg, #FF2E72); 
            	color: var(--cookiebot-button-text, #FFFFFF); 
            	border-color: transparent; 
            	transform: translateY(-1px);
            	box-shadow: 0 4px 8px var(--cookiebot-shadow-color, rgba(30, 30, 30, 0.15));
            }
            .CookieCopyBtn:active { 
            	transform: translateY(0); 
            	box-shadow: 0 2px 4px var(--cookiebot-shadow-color, rgba(30, 30, 30, 0.1));
            }
            .CookieCopyBtn:focus {
            	outline: 2px solid var(--cookiebot-focus-border, #FF2E72);
            	outline-offset: 2px;
            }

            /* Enhanced state pill styling with theme colors */
            .CookieStatePill { 
            	display: inline-block; 
            	padding: 6px 16px; 
            	border-radius: 24px; 
            	border: 1px solid var(--cookiebot-border-color, #E0E0E0); 
            	font-weight: 600; 
            	font-size: 12px; 
            	text-transform: uppercase;
            	letter-spacing: 0.5px;
            	transition: all 150ms ease-out;
            }
            .CookieStatePill.is-allow { 
            	background: var(--cookiebot-success-bg, #D4F7E7); 
            	color: var(--cookiebot-textSuccess, #00AA5E);
            	border-color: var(--cookiebot-success-bg, #D4F7E7);
            }
            .CookieStatePill.is-deny { 
            	background: var(--cookiebot-error-bg, #F8D7DA); 
            	color: var(--cookiebot-error, #db2c3e);
            	border-color: var(--cookiebot-error-bg, #F8D7DA);
            }
            .CookieStatePill.is-partial { 
            	background: var(--cookiebot-warning-bg, #FFF3CD); 
            	color: var(--cookiebot-warning, #E3A30C);
            	border-color: var(--cookiebot-warning-bg, #FFF3CD);
            }

			/* Cookie type sections - flat design */
			.CookieDeclarationType {
				display: block;
				margin: 0 0 32px 0;
				padding: 0 0 24px 0;
				background: transparent;
				border: none;
				border-bottom: 1px solid var(--cookiebot-border-color, #E0E0E0);
				border-radius: 0;
				box-shadow: none;
				transition: none;
			}
			
			.CookieDeclarationType:hover {
				box-shadow: none;
				transform: none;
			}
			
			.CookieDeclarationType:last-child {
				border-bottom: none;
			}
			
			.CookieDeclarationTypeHeader {
				font-weight: 600;
				font-size: 20px;
				margin: 0 0 16px 0;
				color: var(--cookiebot-text-primary, #1E1E1E);
				display: flex;
				align-items: center;
				gap: 8px;
			}
			
			.CookieDeclarationTypeDescription {
				margin: 0 0 24px 0;
				color: var(--cookiebot-text-secondary, #727272);
				line-height: 1.6;
				font-size: 14px;
			}
			
			/* Mobile responsive adjustments for cookie type cards */
			@media screen and (max-width: 768px) {
				.CookieDeclarationType {
					padding: 24px;
					margin: 0 0 24px 0;
				}
				.CookieDeclarationTypeHeader {
					font-size: 18px;
					margin: 0 0 12px 0;
				}
				.CookieDeclarationTypeDescription {
					margin: 0 0 20px 0;
				}
			}

			/* Borderless table wrapper - no borders */
			.CookieDeclarationTableWrap { 
				width: 100%; 
				overflow-x: auto; 
				-webkit-overflow-scrolling: touch; 
				border-radius: 0;
				border: none;
				margin-top: 16px;
			}

			.CookieDeclarationTable {
				table-layout: auto;
				width: 100%;
				border-collapse: collapse;
				border-spacing: 0;
				margin: 0;
				padding: 0;
				border: none;
				font-size: 14px;
				background: transparent;
			}
			
			.CookieDeclarationTableHeader {
				font-weight: 600;
				text-align: left;
				padding: 12px 16px;
				color: var(--cookiebot-text-secondary, #727272);
				border-left: none;
				border-right: none;
				border-top: none;
				border-bottom: 1px solid var(--cookiebot-border-color, #E0E0E0);
				position: sticky;
				top: 0;
				z-index: 1;
				background: var(--cookiebot-hover-bg, rgba(0, 0, 0, 0.03));
				box-shadow: none;
				white-space: normal;
				font-size: 13px;
				text-transform: uppercase;
				letter-spacing: 0.5px;
				word-wrap: break-word;
			}
			
			.CookieDeclarationTableHeader[dir='rtl'] { text-align: right; }

			.CookieDeclarationTableCell {
				text-overflow: ellipsis;
				word-wrap: break-word;
				vertical-align: top;
				padding: 16px;
				border-left: none;
				border-right: none;
				border-top: none;
				border-bottom: 1px solid var(--cookiebot-border-color, #E0E0E0);
				color: var(--cookiebot-text-primary, #1E1E1E);
				line-height: 1.5;
				font-size: 14px;
				transition: background-color 150ms ease-out;
			}

            /* Professional row hover effects */
            .CookieDeclarationTable tbody tr {
            	transition: background-color 150ms ease-out;
            }
            
            .CookieDeclarationTable tbody tr:hover td { 
            	background: var(--cookiebot-hover-bg, rgba(0, 0, 0, 0.03)); 
            	cursor: default;
            }
            
            .CookieDeclarationTable tbody tr:last-child td,
            .CookieDeclarationTable tbody tr:last-child th {
            	border-bottom: none;
            }

			/* Responsive table adjustments */
			@media all and (max-width: 768px) {
				.CookieDeclarationTable {
					min-width: 600px; /* Prevent columns from getting too narrow */
				}
				.CookieDeclarationTableHeader,
				.CookieDeclarationTableCell { 
					padding: 12px 8px; 
					font-size: 13px;
				}
				.CookieDeclarationTableHeader {
					font-size: 11px;
				}
			}
			
			/* Collapsible section functionality */
			.CookieDeclarationTypeHeader {
				cursor: pointer;
				transition: color 150ms ease-out;
				position: relative;
				user-select: none;
			}
			
			.CookieDeclarationTypeHeader:hover {
				color: var(--cookiebot-button-text, #FF2E72);
			}
			
			.CookieDeclarationTypeHeader:focus {
				outline: 2px solid var(--cookiebot-focus-border, #FF2E72);
				outline-offset: 2px;
				border-radius: 4px;
			}
			
			/* Arrow indicator for collapsible state */
			.CookieDeclarationTypeHeader::after {
				content: "▲";
				font-size: 12px;
				margin-left: 8px;
				transition: all 150ms ease-out;
				color: var(--cookiebot-text-secondary, #727272);
			}
			
			.CookieDeclarationTypeHeader.collapsed::after {
				content: "▼";
				transform: none;
			}
			
			/* Collapsible content with smooth transitions */
			.CookieDeclarationCollapsibleContent {
				overflow: hidden;
				transition: max-height 250ms ease-out, opacity 200ms ease-out;
			}
			
			.CookieDeclarationCollapsibleContent.collapsed {
				max-height: 0;
				opacity: 0;
			}
			
			.CookieDeclarationCollapsibleContent.expanded {
				max-height: 5000px;
				opacity: 1;
			}
		</style>
		
		<!-- Pure CSS-only collapsible sections using hidden checkboxes -->
		<style type="text/css">
		/* Hide all checkbox inputs */
		.cookie-toggle {
			display: none;
		}
		
		/* Make headers look clickable */
		.CookieDeclarationTypeHeader {
			position: relative;
			cursor: pointer;
		}
		
		/* All sections expanded by default - no content hiding */
		
		/* When checkbox is checked, HIDE content (invert the logic) */
		.cookie-toggle:checked + .CookieDeclarationType .CookieDeclarationTypeDescription,
		.cookie-toggle:checked + .CookieDeclarationType .CookieDeclarationTableWrap {
			display: none !important;
		}
		
		/* Arrow for expanded state by default for all sections */
		.CookieDeclarationType .CookieDeclarationTypeHeader::after {
			content: "▲";
			transform: none;
		}
		
		/* When checkbox checked (collapsed), show down arrow */
		.cookie-toggle:checked + .CookieDeclarationType .CookieDeclarationTypeHeader::after {
			content: "▼";
			transform: none;
		}
		</style>
		
		<div class="CookieDeclaration">
			<xsl:attribute name="lang">
				<xsl:value-of select="//Labels/Language"></xsl:value-of>
			</xsl:attribute>
			<xsl:attribute name="dir">
				<xsl:value-of select="//Labels/TextDirection"></xsl:value-of>
			</xsl:attribute>

			<!-- General introduction -->
			<div class="CookieDeclarationIntroCard">
				<p class="CookieDeclarationDialogText">
					<xsl:value-of select="//Labels/Title" ></xsl:value-of>. <xsl:value-of select="//Labels/Text" ></xsl:value-of>
				</p>
				<p class="CookieDeclarationIntro">
					<xsl:value-of select="//Labels/CookieGeneralIntro" ></xsl:value-of>
				</p>
				<p class="CookieDeclarationIntro">
					<xsl:value-of select="//Labels/ConsentDomains"></xsl:value-of>
				</p>
			</div>
			<div id="CookieDeclarationUserStatusPanel"></div>
			<br/>
			<p class="CookieDeclarationLastUpdated">
				<xsl:value-of select="//Labels/LastUpdated" disable-output-escaping="yes"></xsl:value-of>:
			</p>

			<!-- Necessary cookies -->
			<xsl:apply-templates select="//Cookies">
				<xsl:with-param name="cookieTypeCategory" select="1"></xsl:with-param>
				<xsl:with-param name="cookieTypeHeader" select="//Labels/CookieTypeNecessaryTitle"></xsl:with-param>
				<xsl:with-param name="cookieTypeDescription" select="//Labels/CookieTypeNecessaryIntro"></xsl:with-param>
			</xsl:apply-templates>

			<!-- Preference cookies -->
			<xsl:apply-templates select="//Cookies">
				<xsl:with-param name="cookieTypeCategory" select="2"></xsl:with-param>
				<xsl:with-param name="cookieTypeHeader" select="//Labels/CookieTypePreferenceTitle"></xsl:with-param>
				<xsl:with-param name="cookieTypeDescription" select="//Labels/CookieTypePreferenceIntro"></xsl:with-param>
			</xsl:apply-templates>

			<!-- Statistic cookies -->
			<xsl:apply-templates select="//Cookies">
				<xsl:with-param name="cookieTypeCategory" select="3"></xsl:with-param>
				<xsl:with-param name="cookieTypeHeader" select="//Labels/CookieTypeStatisticsTitle"></xsl:with-param>
				<xsl:with-param name="cookieTypeDescription" select="//Labels/CookieTypeStatisticsIntro"></xsl:with-param>
			</xsl:apply-templates>

			<!-- Marketing cookies -->
			<xsl:apply-templates select="//Cookies">
				<xsl:with-param name="cookieTypeCategory" select="4"></xsl:with-param>
				<xsl:with-param name="cookieTypeHeader" select="//Labels/CookieTypeMarketingTitle"></xsl:with-param>
				<xsl:with-param name="cookieTypeDescription" select="//Labels/CookieTypeMarketingIntro"></xsl:with-param>
			</xsl:apply-templates>

			<!-- Unclassified cookies -->
			<xsl:apply-templates select="//Cookies">
				<xsl:with-param name="cookieTypeCategory" select="5"></xsl:with-param>
				<xsl:with-param name="cookieTypeHeader" select="//Labels/CookieTypeUnclassifiedTitle"></xsl:with-param>
				<xsl:with-param name="cookieTypeDescription" select="//Labels/CookieTypeUnclassifiedIntro"></xsl:with-param>
			</xsl:apply-templates>

		</div>
	</xsl:template>

	<xsl:template match="//Cookies">
		<xsl:param name="cookieTypeCategory"></xsl:param>
		<xsl:param name="cookieTypeHeader"></xsl:param>
		<xsl:param name="cookieTypeDescription"></xsl:param>
		<xsl:if test="count(//Cookies/Cookie[Category = $cookieTypeCategory]) > 0">
			<!-- Hidden checkbox for CSS-only toggle -->
			<input type="checkbox" class="cookie-toggle">
				<xsl:attribute name="id">toggle-<xsl:value-of select="$cookieTypeCategory"/></xsl:attribute>
				<!-- Check the first section (Necessary) by default -->
				<xsl:if test="$cookieTypeCategory = 'Necessary'">
					<xsl:attribute name="checked">checked</xsl:attribute>
				</xsl:if>
			</input>
			
			<div class="CookieDeclarationType">
				<xsl:attribute name="lang">
					<xsl:value-of select="//Labels/Language"></xsl:value-of>
				</xsl:attribute>
				<xsl:attribute name="dir">
					<xsl:value-of select="//Labels/TextDirection"></xsl:value-of>
				</xsl:attribute>
				<label class="CookieDeclarationTypeHeader">
					<xsl:attribute name="for">toggle-<xsl:value-of select="$cookieTypeCategory"/></xsl:attribute>
					<xsl:value-of select="$cookieTypeHeader" ></xsl:value-of> (<xsl:value-of select="count(//Cookies/Cookie[Category = $cookieTypeCategory]/Domains/Domain)" ></xsl:value-of>)
				</label>
				<p class="CookieDeclarationTypeDescription">
					<xsl:value-of select="$cookieTypeDescription" ></xsl:value-of>
				</p>
				<div class="CookieDeclarationTableWrap">
				<table class="CookieDeclarationTable">
					<colgroup>
						<col style="width: 20%"></col>
						<col style="width: 20%"></col>
						<col style="width: 35%"></col>
						<col style="width: 15%"></col>
						<col style="width: 10%"></col>
					</colgroup>
					<thead>
						<tr>
							<th scope="col" class="CookieDeclarationTableHeader">
								<xsl:attribute name="dir">
									<xsl:value-of select="//Labels/TextDirection"></xsl:value-of>
								</xsl:attribute>
								<xsl:value-of select="//Labels/HeaderName" ></xsl:value-of>
							</th>
							<th scope="col" class="CookieDeclarationTableHeader">
								<xsl:attribute name="dir">
									<xsl:value-of select="//Labels/TextDirection"></xsl:value-of>
								</xsl:attribute>
								<xsl:value-of select="//Labels/HeaderProvider" ></xsl:value-of>
							</th>
							<th scope="col" class="CookieDeclarationTableHeader">
								<xsl:attribute name="dir">
									<xsl:value-of select="//Labels/TextDirection"></xsl:value-of>
								</xsl:attribute>
								<xsl:value-of select="//Labels/HeaderPurpose" ></xsl:value-of>
							</th>
							<th scope="col" class="CookieDeclarationTableHeader">
								<xsl:attribute name="dir">
									<xsl:value-of select="//Labels/TextDirection"></xsl:value-of>
								</xsl:attribute>
								<xsl:value-of select="//Labels/HeaderExpiry" ></xsl:value-of>
							</th>
							<th scope="col" class="CookieDeclarationTableHeader">
								<xsl:attribute name="dir">
									<xsl:value-of select="//Labels/TextDirection"></xsl:value-of>
								</xsl:attribute>
								<xsl:value-of select="//Labels/HeaderType" ></xsl:value-of>
							</th>
						</tr>
					</thead>
					<xsl:apply-templates select="//Cookies/Cookie[Category = $cookieTypeCategory]">
						<xsl:sort select="Name"></xsl:sort>
					</xsl:apply-templates>
				</table>
				</div>
			</div>
		</xsl:if>
	</xsl:template>

	<xsl:template match="//Cookies/Cookie">
		<tr>
			<td class="CookieDeclarationTableCell">
				<xsl:value-of select="Name"></xsl:value-of>
				<xsl:if test="count(Domains/Domain) > 1">
					[x<xsl:value-of select="count(Domains/Domain)"></xsl:value-of>]
				</xsl:if>
			</td>
			<td class="CookieDeclarationTableCell">
				<xsl:for-each select="OriginDomains/Domain">
					<xsl:if test="PrivacyPolicyUrl = ''">
						<xsl:value-of select="DomainName"></xsl:value-of>
					</xsl:if>
					<xsl:if test="PrivacyPolicyUrl != ''">
						<a target="_blank" rel="noopener noreferrer nofollow">
							<xsl:attribute name="href">
								<xsl:value-of select="PrivacyPolicyUrl"></xsl:value-of>
							</xsl:attribute>
							<xsl:attribute name="title">
								<xsl:value-of select="CompanyNamePrivacyPolicy"></xsl:value-of>
							</xsl:attribute>
							<xsl:value-of select="CompanyName"></xsl:value-of>
						</a>
					</xsl:if>
					<xsl:if test="position() != last()">
						<br/>
					</xsl:if>
				</xsl:for-each>
			</td>
			<td class="CookieDeclarationTableCell">
				<xsl:value-of select="Purpose"></xsl:value-of>
			</td>
			<td class="CookieDeclarationTableCell">
				<xsl:value-of select="Expire"></xsl:value-of>
			</td>
			<td class="CookieDeclarationTableCell">
				<xsl:value-of select="TrackerType"></xsl:value-of>
			</td>
		</tr>
	</xsl:template>

</xsl:stylesheet>
