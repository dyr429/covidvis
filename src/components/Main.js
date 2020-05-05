import React from 'react';
import RacingBar from "./charts/RacingBar";
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import RacingLine from "./charts/RacingLine";
import RacingBarStatesVIS from "./visualizations/RacingBarStatesVIS";
import RacingBarCountiesVIS from "./visualizations/RacingBarCountiesVIS";
function Main() {

    return (
        <div className="Main">
            <Container fluid>
                <Row>
                    <Col>
                        <RacingBarStatesVIS></RacingBarStatesVIS>
                    </Col>
                    <Col>
                        <RacingBarCountiesVIS></RacingBarCountiesVIS>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <RacingLine></RacingLine>
                    </Col>
                </Row>

            </Container>
        </div>
    );
}

export default Main;