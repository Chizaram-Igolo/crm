import React, { Component, Fragment } from "react";
import _ from "lodash";
import PropTypes from "prop-types";

import "./styles/Pagination.css";

const LEFT_PAGE = "LEFT";
const RIGHT_PAGE = "RIGHT";

const range = (from, to, step = 1) => {
    let i = from;
    const range = [];

    while (i <= to) {
        range.push(i);
        i += step;
    }

    return range;
};

class Pagination extends Component {
    constructor(props) {
        super(props);
        const {
            totalRecords = null,
            pageLimit = 10,
            pageNeighbours = 0,
        } = props;

        this.pageLimit = typeof pageLimit === "number" ? pageLimit : 10;
        this.totalRecords = typeof totalRecords === "number" ? totalRecords : 0;

        this.pageNeighbours =
            typeof pageNeighbours === "number"
                ? Math.max(0, Math.min(pageNeighbours, 2))
                : 0;

        this.totalPages = Math.ceil(this.totalRecords / this.pageLimit);

        this.state = {
            currentPage: 1,
            pages: _.range(1, this.totalRecords + 1),
        };
    }

    componentDidMount() {
        this.gotoPage(1);
    }

    gotoPage = (page) => {
        const { onPageChanged = (f) => f } = this.props;

        const currentPage = Math.max(0, Math.min(page, this.totalPages));

        const paginationData = {
            currentPage,
            totalPages: this.totalPages,
            pageLimit: this.pageLimit,
            totalRecords: this.totalRecords,
        };

        this.setState({ currentPage }, () => onPageChanged(paginationData));
    };

    handleClick = (page, evt) => {
        evt.preventDefault();
        this.gotoPage(page);
    };

    handleMoveLeft = (evt) => {
        evt.preventDefault();
        this.gotoPage(this.state.currentPage - this.pageNeighbours * 2 - 1);
    };

    handleMoveLeftOneStep = (evt) => {
        evt.preventDefault();
        if (this.state.currentPage > 1) {
            this.gotoPage(this.state.currentPage - 1);
        }
    };

    handleMoveRight = (evt) => {
        evt.preventDefault();
        this.gotoPage(this.state.currentPage + this.pageNeighbours * 2 + 1);
    };

    handleMoveRightOneStep = (evt) => {
        evt.preventDefault();
        this.gotoPage(this.state.currentPage + 1);
    };

    fetchPageNumbers = () => {
        const totalPages = this.totalPages;
        const currentPage = this.state.currentPage;
        const pageNeighbours = this.pageNeighbours;

        const totalNumbers = this.pageNeighbours * 2 + 3;
        const totalBlocks = totalNumbers + 2;

        if (totalPages > totalBlocks) {
            let pages = [];

            const leftBound = currentPage - pageNeighbours;
            const rightBound = currentPage + pageNeighbours;
            const beforeLastPage = totalPages - 1;

            const startPage = leftBound > 2 ? leftBound : 2;
            const endPage =
                rightBound < beforeLastPage ? rightBound : beforeLastPage;

            pages = range(startPage, endPage);

            const pagesCount = pages.length;
            const singleSpillOffset = totalNumbers - pagesCount - 1;

            const leftSpill = startPage > 2;
            const rightSpill = endPage < beforeLastPage;

            const leftSpillPage = LEFT_PAGE;
            const rightSpillPage = RIGHT_PAGE;

            if (leftSpill && !rightSpill) {
                const extraPages = range(
                    startPage - singleSpillOffset,
                    startPage - 1
                );
                pages = [leftSpillPage, ...extraPages, ...pages];
            } else if (!leftSpill && rightSpill) {
                const extraPages = range(
                    endPage + 1,
                    endPage + singleSpillOffset
                );
                pages = [...pages, ...extraPages, rightSpillPage];
            } else if (leftSpill && rightSpill) {
                pages = [leftSpillPage, ...pages, rightSpillPage];
            }

            return [1, ...pages, totalPages];
        }

        return range(1, totalPages);
    };

    render() {
        if (!this.totalRecords) return null;

        if (this.totalPages === 1) return null;

        const { currentPage } = this.state;
        const pages = this.fetchPageNumbers();

        return (
            <Fragment>
                <nav
                    aria-label="Countries Pagination"
                    className="pagination-nav"
                >
                    <div className="pagination-status">
                        <p>
                            Rows per page{" "}
                            <select
                                className="custom-select"
                                style={{
                                    width: "auto",
                                    paddingLeft: "8px",
                                }}
                            >
                                <option selected value={this.pageLimit}>
                                    {this.pageLimit}
                                </option>
                                {this.state.pages.map((item, id) => {
                                    return (
                                        <option value={item} key={id}>
                                            {item}
                                        </option>
                                    );
                                })}
                            </select>{" "}
                            out of {this.totalRecords}
                        </p>
                    </div>
                    <ul className="pagination">
                        {" "}
                        <li
                            className={`page-item${
                                currentPage === 1 ? " disabled" : ""
                            }`}
                        >
                            <button
                                className="page-link"
                                onClick={this.handleMoveLeftOneStep}
                            >
                                Previous
                            </button>
                        </li>
                        {pages.map((page, index) => {
                            if (page === LEFT_PAGE)
                                return (
                                    <li key={index} className="page-item">
                                        <button
                                            className="page-link"
                                            aria-label="Previous"
                                            onClick={this.handleMoveLeft}
                                        >
                                            <span aria-hidden="true">
                                                &laquo;
                                            </span>
                                            <span className="sr-only">
                                                Previous
                                            </span>
                                        </button>
                                    </li>
                                );

                            if (page === RIGHT_PAGE)
                                return (
                                    <li key={index} className="page-item">
                                        <button
                                            className="page-link"
                                            href="#"
                                            aria-label="Next"
                                            onClick={this.handleMoveRight}
                                        >
                                            <span aria-hidden="true">
                                                &raquo;
                                            </span>
                                            <span className="sr-only">
                                                Next
                                            </span>
                                        </button>
                                    </li>
                                );

                            return (
                                <li
                                    key={index}
                                    className={`page-item${
                                        currentPage === page ? " active" : ""
                                    }`}
                                >
                                    <button
                                        className="page-link"
                                        onClick={(e) =>
                                            this.handleClick(page, e)
                                        }
                                    >
                                        {page}
                                    </button>
                                </li>
                            );
                        })}
                        <li className="page-item">
                            <button
                                className="page-link"
                                onClick={this.handleMoveRightOneStep}
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            </Fragment>
        );
    }
}

Pagination.propTypes = {
    totalRecords: PropTypes.number.isRequired,
    pageLimit: PropTypes.number,
    pageNeighbours: PropTypes.number,
    onPageChanged: PropTypes.func,
};

export default Pagination;
